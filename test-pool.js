const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing connection to MariaDB...');
  
  try {
    // Test simple connection first
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'salon_user',
      password: 'JZk)P23$&vGYQns5ysSalon',  // Use the same password that works in CLI
      database: 'salon',
      port: 3306
    });
    
    console.log('✅ Simple connection successful');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error sqlMessage:', error.sqlMessage);
  }
}

testConnection();


/*

-- In MySQL/MariaDB CLI:
CREATE USER 'salon_user'@'localhost' IDENTIFIED BY 'JZk)P23$&vGYQns5ysSalon';
GRANT ALL PRIVILEGES ON salon.* TO 'salon_user'@'localhost';
FLUSH PRIVILEGES;

*/