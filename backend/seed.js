const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Leave = require('./models/Leave');

dotenv.config();

const users = [
    {
        name: 'Admin Employer',
        email: 'admin@test.com',
        password: 'password123',
        role: 'employer'
    },
    {
        name: 'John Employee',
        email: 'employee@test.com',
        password: 'password123',
        role: 'employee'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Leave.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users one by one to ensure password hashing hook works
        const createdUsers = [];
        for (const u of users) {
            const newUser = new User(u);
            await newUser.save();
            createdUsers.push(newUser);
        }
        console.log(`✅ Created ${createdUsers.length} users with hashed passwords`);

        // Create a sample leave request
        const employee = createdUsers.find(u => u.role === 'employee');

        if (employee) {
            await Leave.create({
                employee: employee._id,
                employeeName: employee.name,
                employeeEmail: employee.email,
                leaveType: 'sick',
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
                reason: 'Not feeling well',
                status: 'pending'
            });
            console.log('✅ Created sample leave request');
        }

        console.log('\n--- Accounts Created ---');
        console.log('Employer: admin@test.com / password123');
        console.log('Employee: employee@test.com / password123');
        console.log('------------------------\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
