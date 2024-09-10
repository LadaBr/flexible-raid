import {Injectable} from "@angular/core";
import {interval, Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';
import {environment} from "../../environments/environment";


export interface Message {
  source: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private subject!: AnonymousSubject<MessageEvent>;
  public messages$: Subject<any>;

  constructor() {
    this.messages$ = <Subject<Message>>this.connect(environment.api.ws).pipe(
      map(
        (response: MessageEvent): Message => {
          console.log("WEBSOCKET RES", response.data);
          return JSON.parse(response.data);
        }
      )
    );
    interval(30000).subscribe(() => this.messages$.next("ping"));

  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  private create(url: string): AnonymousSubject<MessageEvent> {
    let ws = new WebSocket(url);
    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      error: (err: any) => {},
      complete: () => {},
      next: (data: Object) => {
        console.log('Message sent to websocket: ', data);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}
