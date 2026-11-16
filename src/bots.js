const mineflayer=require('mineflayer');
class Bots {
 constructor(db,emit){this.db=db;this.emit=emit;this.live=new Map();this.history=new Map()}
 log(id,text){const row={time:new Date().toISOString(),text:String(text).slice(0,400)};const a=this.history.get(id)||[];a.push(row);if(a.length>250)a.shift();this.history.set(id,a);this.emit(id,row)}
 status(id){const x=this.live.get(Number(id));return x?.bot?'online':x?.starting?'starting':'offline'}
 start(id){id=Number(id);if(this.live.has(id))throw Error('Bot läuft bereits');const c=this.db.prepare('SELECT * FROM bots WHERE id=?').get(id);if(!c)throw Error('Bot nicht gefunden');const s={starting:true,stopped:false};this.live.set(id,s);
 const connect=()=>{if(s.stopped)return;this.log(id,'Verbinde zu '+c.host+':'+c.port);try{const bot=mineflayer.createBot({host:c.host,port:c.port,username:c.username,version:c.version||undefined,...(c.bind_ip?{localAddress:c.bind_ip}:{})});s.bot=bot;s.starting=false;bot.once('login',()=>this.log(id,'Login erfolgreich'));bot.on('spawn',()=>this.log(id,'Gespawnt'));bot.on('kicked',r=>this.log(id,'Kick: '+String(r).slice(0,150)));bot.on('error',e=>this.log(id,'Fehler: '+e.message));bot.on('end',()=>{s.bot=null;this.log(id,'Verbindung beendet');if(c.reconnect&&!s.stopped)s.retry=setTimeout(connect,10000);else this.live.delete(id)});if(c.anti_afk)s.afk=setInterval(()=>{if(s.bot?.entity){try{s.bot.setControlState('jump',true);setTimeout(()=>s.bot?.setControlState('jump',false),500)}catch{}}},45000)}catch(e){this.log(id,e.message);this.live.delete(id)}};connect()}
 stop(id){const s=this.live.get(Number(id));if(!s)return;s.stopped=true;clearTimeout(s.retry);clearInterval(s.afk);try{s.bot?.quit('Panel stop')}catch{}this.live.delete(Number(id));this.log(Number(id),'Gestoppt')}
 restart(id){this.stop(id);this.start(id)}
 chat(id,msg){const b=this.live.get(Number(id))?.bot;if(!b)throw Error('Bot ist offline');b.chat(msg)}
 stopAll(){for(const id of this.live.keys())this.stop(id)}
}
module.exports={Bots};
