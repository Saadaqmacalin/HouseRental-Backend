require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Seed Admin
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
                phoneNumber: '1234567890'
            });
            console.log('Admin user created');
        }

        // Seed Customer for testing
        const customerExists = await Customer.findOne({ email: 'test@test.com' });
        if (!customerExists) {
            await Customer.create({
                name: 'Test Customer',
                email: 'test@test.com',
                password: 'password123',
            });
            console.log('Test customer created');
        }
        if (owners.length > 0) {
            await House.deleteMany({});
            await House.create([
                {
                    address: '123 Ocean View Dr, Miami',
                    price: 2500,
                    numberOfRooms: 3,
                    houseType: 'villa',
                    description: 'Stunning villa with direct ocean access and private pool.',
                    status: 'available',
                    owner: owners[0]._id,
                    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                },
                {
                    address: '456 Skyline Ave, New York',
                    price: 4500,
                    numberOfRooms: 2,
                    houseType: 'apartment',
                    description: 'Modern penthouse with floor-to-ceiling windows and city views.',
                    status: 'available',
                    owner: owners[0]._id,
                    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                },
                {
                    address: '789 Forest Retreat, Aspen',
                    price: 3200,
                    numberOfRooms: 4,
                    houseType: 'single house',
                    description: 'Cozy cabin style house perfect for winter holidays.',
                    status: 'available',
                    owner: owners[0]._id,
                    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                },
                {
                    address: '101 Budget Street, downtown',
                    price: 850,
                    numberOfRooms: 1,
                    houseType: 'apartment',
                    description: 'Affordable and cozy apartment in the city center.',
                    status: 'available',
                    owner: owners[0]._id,
                    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                }
            ]);
            console.log('Sample houses seeded with images');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
