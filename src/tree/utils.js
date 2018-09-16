Array.prototype.has = Array.prototype.has || function(e){
  return this.indexOf(String(e)) > -1 || this.indexOf(Number(e)) > -1;
}