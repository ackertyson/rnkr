(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{26:function(e,t,n){e.exports=n(41)},31:function(e,t,n){},32:function(e,t,n){},41:function(e,t,n){"use strict";n.r(t);var a=n(0),s=n.n(a),o=n(21),c=n.n(o),r=(n(31),n(32),n(22)),i=n(7),u=n(25),l=n(13),h=n(6),m=n(8),p=n(10),d=n(9),v=n(2),b=n(11),C=n(15),f="wss://rnkr-api.tysonacker.io/socket",E=(C.Channel,function(){function e(){Object(h.a)(this,e),this.channels={},this.socket=void 0;var t=new C.Socket(f);t.connect(),this.socket=t,this.open=this.open.bind(this),this.send=this.send.bind(this),this.subscribe=this.subscribe.bind(this)}return Object(m.a)(e,[{key:"join",value:function(e){e.join().receive("ok",function(){console.log("Joined ".concat(e.topic," successfully!"))}).receive("error",function(t){console.error("Unable to join ".concat(e.topic,":"),t)})}},{key:"_onError",value:function(e){console.error("Message failed",e)}},{key:"open",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return this.channels[e]=this.socket.channel(e,t),this.join(this.channels[e]),this.channels[e]}},{key:"send",value:function(e,t,n,a,s){if(!this.channels[e])throw new Error("No channel for topic ".concat(e));s=s||this._onError,this.channels[e].push(t,n).receive("ok",a).receive("error",s)}},{key:"subscribe",value:function(e,t,n){var a=this;if(!this.channels[e])throw new Error("No channel for topic ".concat(e));return this.channels[e].on(t,n),function(){return a.channels[e].off(t)}}}]),e}());var k=function(e){var t=Object.keys(e.contestants).map(function(t){return a.createElement("div",{className:"form-group",key:t},a.createElement("button",{type:"button",className:"primary",onClick:e.castVoteFor(t),key:t},e.contestants[t]))});return a.createElement("section",null,e.active||a.createElement("div",null,a.createElement("div",{className:"form-group"},a.createElement("label",null,"Your name"),a.createElement("input",{type:"text",name:"username",defaultValue:e.username,onChange:e.onChange})),a.createElement("div",{className:"form-group"},a.createElement("label",null,"Contest name"),a.createElement("input",{type:"text",name:"contest",defaultValue:e.contest,onChange:e.onChange})),a.createElement("button",{type:"button",onClick:e.joinContest},"Join")),e.active&&a.createElement("div",null,a.createElement("h2",null,e.contest),a.createElement("h4",null,"Which is better?"),t),a.createElement("h4",{className:"status"},e.status))},g=function(e){function t(e){var n;Object(h.a)(this,t);var a=(n=Object(p.a)(this,Object(d.a)(t).call(this,e))).parseQueryParams(e).join;return n.state={active:!1,channel:new E,contest:a||"",contestants:{},score:{},status:"",subscriptions:[],topic:"",username:""},n.castVoteFor=n.castVoteFor.bind(Object(v.a)(n)),n.handleInputChange=n.handleInputChange.bind(Object(v.a)(n)),n.joinContest=n.joinContest.bind(Object(v.a)(n)),n.onError=n.onError.bind(Object(v.a)(n)),n.onVotingComplete=n.onVotingComplete.bind(Object(v.a)(n)),n.setContestants=n.setContestants.bind(Object(v.a)(n)),n}return Object(b.a)(t,e),Object(m.a)(t,[{key:"componentWillUnmount",value:function(){this.state.subscriptions.forEach(function(e){return e()})}},{key:"castVoteFor",value:function(e){var t=this;return function(){return t.state.channel.send(t.state.topic,"cast_vote",{name:e},t.onCastVoteSuccessFor(e))}}},{key:"onCastVoteSuccessFor",value:function(e){var t=this;return function(){return t.state.channel.send(t.state.topic,"get_contestants",null,t.setContestants)}}},{key:"handleInputChange",value:function(e){var t=e.target,n=t.name,a=t.value;this.setState(Object(l.a)({},n,a))}},{key:"joinContest",value:function(){if(!this.state.contest)throw new Error("Enter a contest name!");if(!this.state.username)throw new Error("Enter your name!");var e="contest:voter:".concat(this.state.contest);this.setState({active:!0,topic:e}),this.state.channel.open(e,{username:this.state.username}),this.state.channel.subscribe(e,"voting_complete",this.onVotingComplete.bind(this)),this.state.channel.send(e,"get_contestants",null,this.setContestants,this.onError)}},{key:"onError",value:function(e){this.setState({status:e.reason})}},{key:"onVotingComplete",value:function(){this.setState({active:!1})}},{key:"parseQueryParams",value:function(e){return e.location.search.slice(1).split("&").map(function(e){return e.split("=")}).reduce(function(e,t){var n=Object(u.a)(t,2),a=n[0],s=n[1];return e[a]=s,e},{})}},{key:"render",value:function(){return a.createElement(k,{active:this.state.active,castVoteFor:this.castVoteFor,contest:this.state.contest,contestants:this.state.contestants,joinContest:this.joinContest,onChange:this.handleInputChange,score:this.state.score,status:this.state.status,username:this.state.username})}},{key:"setContestants",value:function(e){this.setState({contestants:e})}}]),t}(a.Component);var y=function(e){var t=Object.keys(e.score).map(function(t){return a.createElement("li",{key:t},t,": ",e.score[t])});return a.createElement("section",null,a.createElement("h2",null,"Moderator"),a.createElement("div",{className:"form-group"},a.createElement("label",null,"Contest name"),a.createElement("input",{type:"text",name:"contest",onChange:e.onChange})),a.createElement("button",{type:"button",onClick:e.createContest},"Create contest"),a.createElement("h4",{className:"status"},e.status),e.contestLink&&a.createElement("p",null,a.createElement("a",{href:e.contestLink},"Contest link")),t.length>0&&a.createElement("div",null,a.createElement("h2",null,"Scores"),a.createElement("ul",null,t)))},j=function(e){function t(e){var n;return Object(h.a)(this,t),(n=Object(p.a)(this,Object(d.a)(t).call(this,e))).state={channel:new E,contest:"",contestLink:"",score:{},status:"",topic:"",username:"admin1"},n.sendCreateContest=n.sendCreateContest.bind(Object(v.a)(n)),n.handleInputChange=n.handleInputChange.bind(Object(v.a)(n)),n.onScoreChange=n.onScoreChange.bind(Object(v.a)(n)),n.updateScore=n.updateScore.bind(Object(v.a)(n)),n.createContest=n.createContest.bind(Object(v.a)(n)),n}return Object(b.a)(t,e),Object(m.a)(t,[{key:"createContest",value:function(){var e=this.state.contest,t="contest:moderator:".concat(e);this.setState({topic:t}),this.state.channel.open(t,{username:this.state.username}),this.sendCreateContest(e,["A","B","C","D"],t)}},{key:"sendCreateContest",value:function(e,t,n){this.state.channel.send(n,"create",{name:e,contestants:t},this.onCreateSuccessFor(e)),this.state.channel.subscribe(n||this.state.topic,"score_change",this.onScoreChange.bind(this))}},{key:"handleInputChange",value:function(e){var t=e.target,n=t.name,a=t.value;this.setState(Object(l.a)({},n,a))}},{key:"onCreateSuccessFor",value:function(e){var t=this;return function(){return t.setState({contestLink:"/?join=".concat(encodeURIComponent(e)),status:"Created contest '".concat(e,"'")})}}},{key:"onScoreChange",value:function(e){this.state.channel.send(this.state.topic,"get_scores",null,this.updateScore)}},{key:"render",value:function(){return a.createElement(y,{contestLink:this.state.contestLink,createContest:this.createContest,onChange:this.handleInputChange,score:this.state.score,status:this.state.status})}},{key:"updateScore",value:function(e){this.setState({score:e})}}]),t}(a.Component);var O=function(){return a.createElement("div",{className:"App"},a.createElement(r.a,null,a.createElement("div",{className:"main"},a.createElement("h1",{className:"page-header"},"Rnkr"),a.createElement(i.a,{exact:!0,path:"/",component:g}),a.createElement(i.a,{path:"/voter",component:g}),a.createElement(i.a,{path:"/moderator",component:j}))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(s.a.createElement(O,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[26,1,2]]]);
//# sourceMappingURL=main.50df7338.chunk.js.map