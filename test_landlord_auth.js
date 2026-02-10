const API_URL = 'http://localhost:5000/api';

const testLandlord = {
    name: 'Test Landlord',
    email: 'testlandlord_' + Date.now() + '@example.com',
    password: 'password123',
    phoneNumber: '1234567890',
    nationalID: 'ID_' + Date.now(),
    address: '123 Test St'
};

const runTests = async () => {
    try {
        console.log('--- Starting Landlord Auth Tests ---');

        // 1. Register Landlord
        console.log('\n1. Testing Landlord Registration...');
        const regRes = await fetch(`${API_URL}/auth/landlord/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testLandlord)
        });
        const regData = await regRes.json();
        
        if (!regRes.ok) {
            throw new Error(`Registration failed: ${regData.message}`);
        }
        
        console.log('Registration Success:', regData.email);
        if (regData.role !== 'landlord') {
            throw new Error('Role "landlord" not found in registration response');
        }
        console.log('Role verified in registration:', regData.role);

        // 2. Login Landlord
        console.log('\n2. Testing Landlord Login...');
        const loginRes = await fetch(`${API_URL}/auth/landlord/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testLandlord.email,
                password: testLandlord.password
            })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginData.message}`);
        }

        console.log('Login Success:', loginData.email);
        if (loginData.role !== 'landlord') {
            throw new Error('Role "landlord" not found in login response');
        }
        console.log('Role verified in login:', loginData.role);
        if (!loginData.token) {
            throw new Error('Token not found in login response');
        }
        console.log('Token received');

        // 3. Duplicate Email check
        console.log('\n3. Testing Duplicate Email Registration...');
        const dupEmailRes = await fetch(`${API_URL}/auth/landlord/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...testLandlord,
                nationalID: 'NEW_ID_' + Date.now()
            })
        });
        const dupEmailData = await dupEmailRes.json();
        if (dupEmailRes.ok) {
            console.error('FAILED: Duplicate email registration should have failed');
        } else {
            console.log('Success: Duplicate email blocked with message:', dupEmailData.message);
        }

        // 4. Duplicate National ID check
        console.log('\n4. Testing Duplicate National ID Registration...');
        const dupIdRes = await fetch(`${API_URL}/auth/landlord/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...testLandlord,
                email: 'newemail_' + Date.now() + '@example.com'
            })
        });
        const dupIdData = await dupIdRes.json();
        if (dupIdRes.ok) {
            console.error('FAILED: Duplicate National ID registration should have failed');
        } else {
            console.log('Success: Duplicate National ID blocked with message:', dupIdData.message);
        }

        console.log('\n--- All Landlord Auth Tests Passed! ---');
    } catch (error) {
        console.error('\n--- Test Failed! ---');
        console.error('Error:', error.message);
        process.exit(1);
    }
};

runTests();
