export class Author {
  id: string;
  name: string;
  gonik: boolean;
  pinned: boolean;
  manager: boolean;
  sub: boolean;
  constructor(
    id: string,
    name: string,
    gonik: boolean,
    pinned: boolean,
    sub: boolean,
    manager: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.gonik = gonik;
    this.pinned = pinned;
    this.manager = manager;
    this.sub = sub;
  }
}
