export class Controls {
  isUp = false;
  isDown = false;
  isLeft = false;
  isRight = false;
  isAccept = false;
  isEscape = false;

  keyboardConfigWASD = {
    up: "KeyW",
    right: "KeyD",
    down: "KeyS",
    left: "KeyA",
    accept: "Enter",
    exit: "Escape",
  };

  keyboardConfigZQSD = {
    up: "KeyZ",
    right: "KeyD",
    down: "KeyS",
    left: "KeyQ",
    accept: "Enter",
    exit: "Escape",
  };

  keyboardConfigArrows = {
    up: "ArrowUp",
    right: "ArrowRight",
    down: "ArrowDown",
    left: "ArrowLeft",
    accept: "Enter",
    exit: "Escape",
  };

  config = this.keyboardConfigArrows;

  constructor() {
    document.addEventListener("keydown", (event) =>
      this.toggleKey(event, true)
    );
    document.addEventListener("keyup", (event) => this.toggleKey(event, false));
  }

  private toggleKey(event: KeyboardEvent, isPressed: boolean) {
    switch (event.code) {
      case this.config.up:
        this.isUp = isPressed;
        break;
      case this.config.down:
        this.isDown = isPressed;
        break;
      case this.config.left:
        this.isLeft = isPressed;
        break;
      case this.config.right:
        this.isRight = isPressed;
        break;
      case this.config.accept:
        this.isAccept = isPressed;
        break;
      case this.config.exit:
        this.isEscape = isPressed;
    }
  }
}

// export const controls = new Controls();
