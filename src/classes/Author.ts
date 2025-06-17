export class Author {
  id: string;
  name: string;
  gonik: boolean;
  pinned: boolean;

  constructor(id: string, name: string, gonik: boolean, pinned: boolean) {
    this.id = id;
    this.name = name;
    this.gonik = gonik;
    this.pinned = pinned;
  }
}
