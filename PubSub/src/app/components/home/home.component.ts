import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private subscriptionService: SubscriptionService,
    private router: Router,
    private changeDetectorRefs: ChangeDetectorRef) { }

  subscribedDriverTableColumns: string[] = ['Pos', 'Driver', 'Car', 'Points', 'Race', 'Q1', 'Q2', 'Q3'];

  driverTableData = [];

  username: String | null = "";
  main_topics: any[] = []
  sub_topics: any[] = []
  main_topic_selected: any = {}
  sub_topic_selected: any = {}
  drivers: any[] = []
  constructors: any[] = []
  races: any[] = []
  years: any[] = []

  driversList: any[] = [];
  driverSelected: boolean = false

  constructorsList: any[] = [];
  constructorSelected: boolean = false

  racesList: any[] = [];
  raceSelected: boolean = false

  yearsList: any[] = [];
  yearSelected: boolean = false

  user_subscribed_topics: any[] = []
  all_main_topic_names: any[] = []

  showHiddenDiv: boolean = true

  mainTopic: any = ""
  subTopic: any = ""
  subscription_message: any = ""

  user_subscription_table_data: any = []
  user_subscription_table_columns: any[] = [
    {
      columnDef: "select",
      header: "Select"
    },
    {
      columnDef: "main_topic",
      header: "Main Topic"
    },
    {
      columnDef: "sub_topic",
      header: "Sub Topic"
    },
    {
      columnDef: "names",
      header: "Names"
    }];

  drivers_table_data: any = []
  drivers_table_columns: any[] = [
    {
      columnDef: "position",
      header: "Position"
    },
    {
      columnDef: "driver_name",
      header: "Name"
    },
    {
      columnDef: "constructor_name",
      header: "Car"
    },
    {
      columnDef: "race_name",
      header: "Race"
    },
    {
      columnDef: "race_year",
      header: "Year"
    },
    {
      columnDef: "points",
      header: "Points"
    }];
  driverTableColumns = this.drivers_table_columns.map(c => c.columnDef);

  constructors_table_data: any = []
  constructors_table_columns: any[] = [
    {
      columnDef: "position",
      header: "Position"
    },
    {
      columnDef: "constructor_name",
      header: "Car"
    },
    {
      columnDef: "race_name",
      header: "Race"
    },
    {
      columnDef: "race_year",
      header: "Year"
    },
    {
      columnDef: "points",
      header: "Points"
    }];
  constructorTableColumns = this.constructors_table_columns.map(c => c.columnDef);

  subscriptionTableSelection = new SelectionModel<any>(true, []);
  displayedUserSubscriptionColumns = this.user_subscription_table_columns.map(c => c.columnDef);

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username')
    this.subscriptionService.getTopicList().subscribe((data: any) => {
      this.main_topics = data.topics
      this.drivers = data.drivers
      this.constructors = data.constructors
      this.races = data.races.filter((race: any) => race.name != "TBA")
      this.years = data.years

      this.setSubscriptionTable()
    })
    this.setDriversTable()
    this.setConstructorsTable()
  }

  onLogout(){
    sessionStorage.setItem('username', "")
    this.router.navigate(['/login'])
  }

  setDriversTable() {
    let user = {
      "username": this.username,
      "main_topic_id": 1
    }

    this.subscriptionService.getUserSubscriptionData(user).subscribe((data: any) => {
      this.drivers_table_data = data
    })

  }

  setConstructorsTable() {
    let user = {
      "username": this.username,
      "main_topic_id": 2
    }

    this.subscriptionService.getUserSubscriptionData(user).subscribe((data: any) => {
      this.constructors_table_data = data
    })

  }


  setSubscriptionTable() {
    let user = {
      username: this.username
    }

    this.subscriptionService.getUserSubscriptions(user).subscribe((data: any) => {
      this.user_subscribed_topics = data.topics
      this.all_main_topic_names = data.all_main_topic_names
      // console.log(this.user_subscribed_topics)
      var table_data: any = []
      for (let main_topic of this.user_subscribed_topics) {
        let sub_topic_exist: boolean = false
        for (let sub_topic of main_topic.sub_topics) {
          sub_topic_exist = true
          let subTopicValues = []
          switch (sub_topic.name.toUpperCase()) {
            case "DRIVER NAME":
              subTopicValues = this.drivers.filter(driver => sub_topic.value.includes(driver.driverId)).map(driver => driver.name)
              break
            case "CONSTRUCTOR NAME":
              subTopicValues = this.constructors.filter(constructor => sub_topic.value.includes(constructor.constructorId)).map(constructor => constructor.name)
              break
            case "RACE NAME":
              subTopicValues = this.races.filter(race => sub_topic.value.includes(race.name)).map(race => race.name)
              break
            case "YEAR":
              subTopicValues = this.years.filter(year => sub_topic.value.includes(year.name.toString())).map(year => year.name)
              break
          }
          table_data.push({
            "topicId": main_topic.topicId,
            "name": main_topic.name,
            "sub_topic_name": sub_topic.name,
            "sub_topic_topicId": sub_topic.topicId,
            "sub_topic_values": sub_topic.value.length == 0 ? "----" : subTopicValues.join(", ")
          })
        }
        if (!sub_topic_exist || main_topic['also_subscribed_to_all_of_main_topic']) {
          table_data.push({
            "topicId": main_topic.topicId,
            "name": main_topic.name,
            "sub_topic_name": "----",
            "sub_topic_topicId": "----",
            "sub_topic_values": "----"
          })
        }
      }
      this.user_subscription_table_data = []
      this.user_subscription_table_data = table_data
    })
  }


  getUserSubscriptionTableData() {
    this.user_subscription_table_data
  }

  preSelectSelect() {

    this.driversList = []
    this.constructorsList = []
    this.racesList = []
    this.yearsList = []
    for (let main_topic of this.user_subscribed_topics) {
      if (this.main_topic_selected.name.toUpperCase() == main_topic.name.toUpperCase()) {
        for (let sub_topic of main_topic.sub_topics) {
          if (this.sub_topic_selected.name.toUpperCase() == sub_topic.name.toUpperCase()) {
            switch (sub_topic.name.toUpperCase()) {
              case "DRIVER NAME":
                this.driversList = sub_topic.value
                break
              case "CONSTRUCTOR NAME":
                this.constructorsList = sub_topic.value
                break
              case "RACE NAME":
                this.racesList = sub_topic.value
                break
              case "YEAR":
                this.yearsList = sub_topic.value
                break
            }
            break
          }
        }
        break
      }
    }

  }

  // toggleAllDriversSelection(allDriversSelected: any) {
  //   if(allDriversSelected._selected){
  //     this.driversList = this.drivers.map(driver => driver.driverId)
  //     this.driversList.push("0")
  //   }
  //   else{
  //     this.driversList = []
  //   }
  // }

  // toggleAllConstructorsSelection(allConstructorsSelected: any) {
  //   if(allConstructorsSelected._selected)
  //     this.constructorsList = this.constructors.map(constructor => constructor.constructorId)
  //   else
  //     this.constructorsList = []
  // }
  // toggleAllRacesSelection(allRacesSelected: any) {
  //   if(allRacesSelected._selected)
  //     this.racesList = this.races.map(race => race.name)
  //   else
  //     this.racesList = []
  // }

  mainTopicSelected(main_topic: any) {
    this.main_topic_selected = main_topic
    this.driverSelected = false
    this.constructorSelected = false
    this.raceSelected = false

    this.sub_topic_selected = {}
    this.driversList = []
    this.constructorsList = []
    this.racesList = []
    this.yearsList = []

  }

  subTopicSelected(sub_topic: any) {
    this.sub_topic_selected = sub_topic

    this.driversList = []
    this.constructorsList = []
    this.racesList = []
    this.yearsList = []

    if (sub_topic.name.toUpperCase() == 'DRIVER NAME')
      this.driverSelected = true
    else
      this.driverSelected = false

    if (sub_topic.name.toUpperCase() == 'CONSTRUCTOR NAME')
      this.constructorSelected = true
    else
      this.constructorSelected = false
    if (sub_topic.name.toUpperCase() == 'RACE NAME')
      this.raceSelected = true
    else
      this.raceSelected = false

    if (sub_topic.name.toUpperCase() == 'YEAR')
      this.yearSelected = true
    else
      this.yearSelected = false

    if (this.driverSelected || this.constructorSelected || this.raceSelected)
      this.showHiddenDiv = false

    this.preSelectSelect()
  }

  onUnsubscription() {
    let topic_ids = []
    for (let topics of this.subscriptionTableSelection.selected) {
      if (topics.sub_topic_topicId == "----") {
        topic_ids.push(topics.topicId)
      }
      else {
        topic_ids.push(topics.sub_topic_topicId)
      }
    }

    let user: any = {
      username: this.username,
      topic_ids: topic_ids
    }
    console.log(user)
    this.subscriptionService.unsubscribeUserTopics(user).subscribe((user_data: any) => {
      this.setSubscriptionTable()
      this.setDriversTable()
      this.setConstructorsTable()
    })
  }

  onSubscription() {

    var user_subscriptions: any = {
      username: this.username,
      topics: []
    }

    let sub_topic_updated: boolean = false
    if (this.mainTopic == "") {
      this.subscription_message = "Please select a topic to subscribe to."
      return
    }
    this.subscription_message = ""
    let topic_added: boolean = false
    for (let main_topic of this.user_subscribed_topics) {
      for (let sub_topic of main_topic.sub_topics) {
        if (this.subTopic != "" && sub_topic.name.toUpperCase() == this.sub_topic_selected.name.toUpperCase() && main_topic.name.toUpperCase() == this.main_topic_selected.name.toUpperCase()) {
          let updated_sub_topic = sub_topic
          sub_topic_updated = true
          switch (sub_topic.name.toUpperCase()) {
            case "DRIVER NAME":
              updated_sub_topic['value'] = this.driversList
              break
            case "CONSTRUCTOR NAME":
              updated_sub_topic['value'] = this.constructorsList
              break
            case "RACE NAME":
              updated_sub_topic['value'] = this.racesList
              break
            case "YEAR":
              updated_sub_topic['value'] = this.yearsList
              break
          }
          topic_added = true
          user_subscriptions.topics.push(updated_sub_topic)
        }
        else {
          topic_added = true
          user_subscriptions.topics.push(sub_topic)
        }
      }
      if (this.subTopic != "" && !sub_topic_updated) {
        sub_topic_updated = true
        this.sub_topic_selected['type'] = 'sub_topic'
        switch (this.sub_topic_selected.name.toUpperCase()) {
          case "DRIVER NAME":
            topic_added = true
            this.sub_topic_selected['value'] = this.driversList
            break
          case "CONSTRUCTOR NAME":
            topic_added = true
            this.sub_topic_selected['value'] = this.constructorsList
            break
          case "RACE NAME":
            topic_added = true
            this.sub_topic_selected['value'] = this.racesList
            break
          case "YEAR":
            topic_added = true
            this.sub_topic_selected['value'] = this.yearsList
            break
        }
        topic_added = true
        user_subscriptions.topics.push(this.sub_topic_selected)
      }
      if ((this.subTopic != "" && !sub_topic_updated) && (main_topic.name.toUpperCase() == this.main_topic_selected.name.toUpperCase()) || (main_topic['also_subscribed_to_all_of_main_topic'])) {
        topic_added = true
        user_subscriptions.topics.push({
          "mainTopicId": null,
          "topicId": main_topic.topicId,
          "name": main_topic.name,
          "type": "main_topic"
        })
      }
    }

    if (this.all_main_topic_names.map(name => name.toUpperCase()).includes(this.main_topic_selected.name.toUpperCase()) && this.subTopic == "" && !sub_topic_updated) {
      topic_added = true
      user_subscriptions.topics.push({
        "mainTopicId": null,
        "topicId": this.main_topic_selected.topicId,
        "name": this.main_topic_selected.name,
        "type": "main_topic"
      })
    }

    if (!topic_added) {
      let subs_topic: any = {
        "mainTopicId": this.sub_topic_selected.mainTopicId,
        "topicId": this.sub_topic_selected.topicId,
        "name": this.sub_topic_selected.name,
        "type": "sub_topic"
      }
      switch (this.sub_topic_selected.name.toUpperCase()) {
        case "DRIVER NAME":
          topic_added = true
          subs_topic['value'] = this.driversList
          break
        case "CONSTRUCTOR NAME":
          topic_added = true
          subs_topic['value'] = this.constructorsList
          break
        case "RACE NAME":
          topic_added = true
          subs_topic['value'] = this.racesList
          break
        case "YEAR":
          topic_added = true
          subs_topic['value'] = this.yearsList
          break
      }
      user_subscriptions.topics.push(subs_topic)
    }

    this.subscriptionService.subscribeToTopics(user_subscriptions).subscribe((data: any) => {
      this.driversList = []
      this.driverSelected = false
      this.constructorsList = []
      this.constructorSelected = false
      this.racesList = []
      this.raceSelected = false
      this.yearsList = []
      this.yearSelected = false

      this.mainTopic = ""
      this.main_topic_selected = {}
      this.subTopic = ""
      this.sub_topic_selected = {}

      let user = {
        username: this.username
      }

      this.setSubscriptionTable()
      this.setDriversTable()
      this.setConstructorsTable()
    })

  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.subscriptionTableSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isAllSelected() {
    const numSelected = this.subscriptionTableSelection.selected.length;
    const numRows = this.user_subscription_table_data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.subscriptionTableSelection.clear();
      return;
    }
    this.subscriptionTableSelection.select(...this.user_subscription_table_data);
  }

}
