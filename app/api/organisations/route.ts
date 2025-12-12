import { NextRequest, NextResponse } from 'next/server';
import { User, Organization } from '@/models';
import connectDB from '@/lib/db';
import { allowRoles } from '@/lib/roleGuardServer';
import { auth } from '@/lib/auth';

// GET /api/organisations - Get user's organizations
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
    if (!ok) return res;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id)
      .populate({
        path: 'associatedWith.organisationId',
        model: 'Organization',
        select: 'name description logo'
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform the data to include organization details and user role
    const organizations = user.associatedWith
      .filter((assoc: any) => assoc.isActive)
      .map((assoc: any) => ({
        _id: assoc.organisationId._id,
        name: assoc.organisationId.name,
        description: assoc.organisationId.description,
        logo: assoc.organisationId.logo,
        userRole: assoc.role,
        userPermissions: assoc.permissions,
        joinedAt: assoc.joinedAt,
      }));

    return NextResponse.json({ organizations });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organisations - Create new organization
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // For organization creation, we just need to verify the user is authenticated
    // No role check needed since user might not have any organization yet
    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      name,
      description,
      industry,
      size,
      location,
      contact,
      settings,
      billing
    } = body;

    // Validate required fields
    if (!name || !contact?.email) {
      return NextResponse.json({
        error: 'Missing required fields: name and contact.email are required'
      }, { status: 400 });
    }

    // Create organization
    const organization = new Organization({
      name,
      description,
      industry,
      size,
      location: {
        timezone: location?.timezone || 'UTC',
        ...location
      },
      contact,
      settings: {
        allowUserRegistration: false,
        requireEmailVerification: true,
        defaultUserRole: 'employee',
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        language: 'en',
        ...settings
      },
      billing,
      createdBy: session.user.id,
      isActive: true,
      isVerified: false
    });

    await organization.save();

    // Add user to organization as admin
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clean up any invalid associatedWith entries (those without organisationId)
    user.associatedWith = user.associatedWith.filter((assoc: any) => assoc.organisationId);

    user.associatedWith.push({
      organisationId: organization._id,
      role: 'admin',
      joinedAt: new Date(),
      isActive: true,
      permissions: ['manage_organization', 'manage_users', 'manage_teams', 'manage_projects']
    });

    // Set as current organization if user doesn't have one
    if (!user.currentOrganization) {
      user.currentOrganization = organization._id;
    }

    await user.save();

    return NextResponse.json({
      message: 'Organization created successfully',
      organization: {
        ...organization.toJSON(),
        userRole: 'admin',
        userPermissions: ['manage_organization', 'manage_users', 'manage_teams', 'manage_projects'],
        joinedAt: new Date()
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating organization:', error);

    if (error.code === 11000) {
      return NextResponse.json({
        error: 'Organization with this name already exists'
      }, { status: 409 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Validation error',
        details: Object.values(error.errors).map((e: any) => e.message)
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
