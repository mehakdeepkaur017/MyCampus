const body = JSON.stringify({name:"john",email:"johntest@gmail.com",password:"123456",role:"ADMIN"});
fetch("http://localhost:3000/api/auth/register", {method:"POST",headers:{"Content-Type":"application/json"},body}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d))).catch(e=>console.error(e));
