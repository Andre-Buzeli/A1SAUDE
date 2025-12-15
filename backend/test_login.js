const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post('http://localhost:5001/api/v1/auth/login', {
      emailOrCpf: 'admin@a1saude.com.br',
      password: '123456'
    });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    console.log('ERROR:', error.response ? error.response.data : error.message);
  }
}

testLogin();
