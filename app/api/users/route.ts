import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models/User'
import connectDB from '@/lib/db'
import { testEmailConnection } from '@/lib/email'

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        await testEmailConnection()

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const department = searchParams.get('department')
        const role = searchParams.get('role')

        // Build query
        let query: any = {}
        if (status && status !== 'all') {
            query.status = status
        }
        if (department && department !== 'all') {
            query.department = department
        }
        if (role && role !== 'all') {
            query.role = role
        }

        // Fetch users
        const users = await User.find(query)
            .select('-password') // Exclude password from response
            .sort({ joinedAt: -1 })

        return NextResponse.json({
            success: true,
            users
        })

    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB()

        await testEmailConnection()

        const body = await request.json()
        const { name, email, role, password, department, phone, location, skills } = body
        console.log(body)

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password,
            role: 'employee',
            phone,
            status: 'pending', // Will be updated when user is activated
            isActive: false
        })

        await newUser.save()

        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status
            }
        })

    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
