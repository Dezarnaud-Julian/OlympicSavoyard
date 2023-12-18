export class Chronometer {
  startDate: Date | null = null;

  start = () => {
    this.startDate = new Date();
    console.log("START !");
  }

  stop = (): number => {
    if (this.startDate !== null) {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - this.startDate.getTime());
      const diffInSeconds = diffTime / 1000;
      this.startDate = null;
      console.log("STOP ", diffInSeconds);
      return diffInSeconds;
    } else {
      // La chronomètre n'était pas démarré
      console.log("Le chronomètre n'était pas démarré.");
      return -1;
    }
  }
}