
export class Chronometer {
  startDate: Date | null = null;
  start = () => {
    this.startDate = new Date();
    console.log("START !")
  }
  stop = () => {
    if (this.startDate != null) {
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - this.startDate.getTime());
      console.log("STOP ", diffTime / 1000)
      this.startDate = null;
    }

  }
}