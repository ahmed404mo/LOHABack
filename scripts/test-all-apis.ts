import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
let adminToken = '';

async function testAPI() {
  console.log('\n========== TESTING ALL APIS ==========\n');
  
  // 1. Login
  try {
    const login = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'admin@loha.com',
      password: '0100admin'
    });
    adminToken = login.data.data.token;
    console.log('✅ 1. Login successful');
    console.log('   Token:', adminToken.substring(0, 50) + '...');
  } catch (error: any) {
    console.log('❌ 1. Login failed:', error.response?.data);
    return;
  }
  
  // 2. Get all products
  try {
    const products = await axios.get(`${BASE_URL}/api/products`);
    console.log('✅ 2. Get products:', products.data.data.length, 'products found');
  } catch (error: any) {
    console.log('❌ 2. Get products failed:', error.response?.data);
  }
  
  // 3. Get user profile
  try {
    const profile = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ 3. Get profile:', profile.data.data.name);
  } catch (error: any) {
    console.log('❌ 3. Get profile failed:', error.response?.data);
  }
  
  // 4. Get all users (admin only)
  try {
    const users = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ 4. Get all users:', users.data.data.length, 'users found');
  } catch (error: any) {
    console.log('❌ 4. Get all users failed:', error.response?.data);
  }
  
  // 5. Get all orders
  try {
    const orders = await axios.get(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ 5. Get all orders:', orders.data.data.length, 'orders found');
  } catch (error: any) {
    console.log('❌ 5. Get all orders failed:', error.response?.data);
  }
  
  // 6. Get all custom orders
  try {
    const customOrders = await axios.get(`${BASE_URL}/api/custom-orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ 6. Get custom orders:', customOrders.data.data.length, 'custom orders found');
  } catch (error: any) {
    console.log('❌ 6. Get custom orders failed:', error.response?.data);
  }
  
  console.log('\n========== TEST COMPLETE ==========\n');
}

testAPI();