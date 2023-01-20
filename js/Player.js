export class Player {
  constructor(name) {
    this.name = name;
    this.roleId = 0;
    this.status = 0; // 0: In Game, 1: Voted, 2: NightShoot, 3: KickedOut 
  }
  
  voted() {
    this.status = 1;
  }

  nightShoot() {
    this.status = 2;
  }

  kickOut() {
    this.status = 3;
  }

  setRole(roleId){
    this.roleId = roleId;
  }

  static Player_Factory(){
    let players = [
      new Player("A").setRole(1), 
      new Player("B").setRole(2), 
      new Player("C").setRole(4) 
    ];
  }
}


