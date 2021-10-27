import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private userService: UserService,
    private router: Router) { }


  username: String = "";
  password: String = "";
  message: String = "";


  ngOnInit(): void {
    if(sessionStorage.getItem('username') != null && sessionStorage.getItem('username') != ""){
      this.router.navigate(['']);
    }
  }


  register(){
    this.router.navigate(['/register'])
  }

  onLoginSubmit(){
    var user= {
      username: this.username,
      password: this.password      
    }
    
    this.userService.authenticateUser(user).subscribe((data: any) => {
      if(data.msg == "Invalid Credentials.") {
        this.message = data.msg
      } else {
        //set login session
        sessionStorage.setItem('username', data.username)
        this.router.navigate(['']);
      }
  });
  }

}
