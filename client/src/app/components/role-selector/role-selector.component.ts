import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-role-selector',
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.scss']
})
export class RoleSelectorComponent implements OnInit {
  roles = ["tank", "healer", "dmg"];
  @Input() selectedRole?: string | null;
  @Output() selectRole = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit(): void {
  }

}
