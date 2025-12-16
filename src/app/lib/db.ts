import mysql from 'mysql2/promise'

// const db = mysql.createPool({
//   host: 'localhost',      
//   user: 'salon_user',           
//   password: 'JZk)P23$&vGYQns5ysSalon',           
//   database: 'salon', 
// });


const db = mysql.createPool({
  host: 'localhost',      
  user: 'root',           
  password: '',           
  database: 'salon', 
});


export default db;
