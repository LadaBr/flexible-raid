import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {GuildWithConfig} from "../../services/calendar.service";
import {DiscordService} from "../../services/discord.service";

@Component({
  selector: 'app-guild-select',
  templateUrl: './guild-select.component.html',
  styleUrls: ['./guild-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuildSelectComponent implements OnInit {
  @Input() selectedGuild?: GuildWithConfig | null;
  @Input() guilds?: GuildWithConfig[] | null = [];
  @Output() selected = new EventEmitter<GuildWithConfig>();

  @HostBinding('class.expanded') expanded = false;

  get validGuilds() {
    return this.guilds?.filter(g => g.config && g !== this.selectedGuild) || [];
  }

  constructor(public discordService: DiscordService, private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onDocumentClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.expanded = false;
    }
  }
}
