import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }


  username: String = "";
  password: String = "";
  repassword: String = "";
  message: String = "";


  ngOnInit(): void {
    if(sessionStorage.getItem('username') != null && sessionStorage.getItem('username') != ""){
      this.router.navigate(['']);
    }
  }


  onLoginClick(){
    this.router.navigate(['/login'])
  }

  validate(){
    if(this.password != this.repassword){
      this.message = "Passwords do not match"
      return false
    }
    else{
      return true
    }
  }

  onRegisterSubmit(){

    var valid = this.validate()

    if(valid){
      var user= {
        username: this.username,
        password: this.password      
      }
      
      this.userService.registerUser(user).subscribe((data: any) => {
        if(data.msg == "Register Successful") {
          this.router.navigate(['login']);
        } else {
          this.message = data.msg
        }
      });
    }

    
  }
}
