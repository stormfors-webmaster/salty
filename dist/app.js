(()=>{function W(){console.log("map.js module loaded");let f="pk.eyJ1IjoiZmVsaXhoZWxsc3Ryb20iLCJhIjoiY20zaXhucjcwMDVwdTJqcG83ZjMxemJlciJ9._TipZd1k8nMEslWbCDg6Eg",t=9,n=[-118.37655405160609,33.78915439099377],o=0;mapboxgl.accessToken=f;let i=new mapboxgl.Map({container:"map",style:"mapbox://styles/cv-mapbox/cm5zh2w0i002g01sfdcrs6dgj",projection:"globe",zoom:t,center:n,pitch:o});i.addControl(new mapboxgl.NavigationControl,"bottom-right"),i.addControl(new mapboxgl.GeolocateControl({positionOptions:{enableHighAccuracy:!0},trackUserLocation:!0,showUserHeading:!0}),"bottom-right"),window.dev={openHome:v,closeHome:x,openBeachList:u,closeBeachList:y,openBeach:I,closeBeach:b,openShop:z};let a=new Map;s();async function s(){d(),c(),window.location.search.includes("beaches")&&(console.log("beaches query found"),x(),u(),window.history.pushState({},"",window.location.pathname)),window.innerWidth<=991&&$(".mapboxgl-ctrl-bottom-right").hide()}function c(){document.querySelectorAll("[temp-data=beach]").forEach(r=>{let m=r.getAttribute("temp-id"),h=parseFloat(r.getAttribute("lat")),p=parseFloat(r.getAttribute("lon"));if(isNaN(h)||isNaN(p)||h<-90||h>90||p<-180||p>180){console.warn(`Invalid coordinates for beach ${m}: lat=${h}, lon=${p}`);return}let E=[p,h],T=r.getAttribute("popup-text");l(E,T,m)})}function l(e,r,m){let h=new mapboxgl.Popup({offset:25}).setText(r),p=document.createElement("div");p.className="beach-marker",p.id=m;let E=new mapboxgl.Marker(p).setLngLat(e).setPopup(h).addTo(i);a.set(m,E),h.on("open",()=>{let T=h.getLngLat().lng,q=h.getLngLat().lat;console.log("popup opened"),console.log(m),i.flyTo({center:[T,q],zoom:14,pitch:75}),S(),u(),I(m),window.scrollTo({top:0,behavior:"instant"})}),h.on("close",()=>{console.log("popup closed"),console.log(m),window.scrollTo({top:0,behavior:"instant"})})}function d(){document.addEventListener("click",e=>{if(e.target.matches("[open-sidebar=home], [open-sidebar=home] *")&&(e.preventDefault(),S(),v(),M()),e.target.matches("[open-sidebar=beach-list], [open-sidebar=beach-list] *")&&(e.preventDefault(),S(),window.innerWidth>479&&u(),window.innerWidth<=991&&C(),window.innerWidth<=479&&u()),e.target.matches("[map-link=item], [map-link=item] *")){let r=e.target.matches("[map-link=item]")?e.target:e.target.closest("[map-link=item]"),m=r.getAttribute("lat"),h=r.getAttribute("lon"),p=r.getAttribute("temp-id");D(p),i.flyTo({center:[h,m],zoom:14,pitch:75}),I(p)}if(e.target.matches(".modal_close-button, .modal_close-button *, .mobile-back, .mobile-back *")&&b(),e.target.matches("[close-sidebar=beach]")&&(V(),u()),e.target.matches("[map-function=expand]")&&(C(),setTimeout(()=>{$("[sidebar-toggle=beach-list]").show(),$(".mapboxgl-ctrl-bottom-right").show()},1e3)),e.target.matches("[map-function=collapse] *, [map-function=collapse]")&&(k(),$("[sidebar=beach-list]").css({transform:"translateX(-100%)",transition:"none"}),$("[sidebar=home]").css({transform:"translateX(0%)",transition:"none"}),$("[sidebar-toggle=beach-list]").hide(),$(".mapboxgl-ctrl-bottom-right").hide()),e.target.matches("[toggle-sidebar=home]")&&B(),e.target.matches("[toggle-sidebar=beach-list]")&&P(),e.target.matches(".mob-beach-top-inner, .mob-beach-top-inner *")&&(console.log("mob-beach-top-inner clicked"),b(),u()),e.target.matches("[stormfors-sort=reverse]")){let r=document.querySelector(".beach-list_list"),m=[...r.children];m.reverse(),m.forEach(h=>r.appendChild(h))}})}function B(){$("[sidebar-toggle=home]").hasClass("folded")?v():x()}function P(){$("[sidebar-toggle=beach-list]").hasClass("folded")?u():(y(),b())}function C(){$("[map-function=expand]").hide(),$("[map-function=container]").addClass("expanded");for(let e=0;e<100;e++)setTimeout(()=>{i.resize()},e*10);i.resize(),setTimeout(()=>{i.resize(),$("[map-function=collapse]").show()},1e3)}function k(){$("[map-function=collapse]").hide(),$("[map-function=container]").removeClass("expanded");for(let e=0;e<100;e++)setTimeout(()=>{i.resize()},e*10);setTimeout(()=>{$("[map-function=expand]").show()},1e3)}function z(){window.scrollTo({top:0,behavior:"instant"}),$("[page=shop]").removeClass("hide")}function N(){window.scrollTo({top:0,behavior:"instant"}),$("[page=shop]").addClass("hide")}function v(){window.scrollTo({top:0,behavior:"instant"}),$("[sidebar=home]").removeClass("folded"),$("[sidebar-toggle=home]").removeClass("folded"),setTimeout(()=>{$("[map-function=expand]").show(),$("[home-toggle-icon=when-open]").show(),$("[home-toggle-icon=when-closed]").hide()},500)}function x(){window.scrollTo({top:0,behavior:"instant"}),$("[sidebar=home]").addClass("folded"),$("[sidebar-toggle=home]").addClass("folded"),$("[home-toggle-icon=when-open]").hide(),$("[home-toggle-icon=when-closed]").show()}function u(){window.scrollTo({top:0,behavior:"instant"}),window.innerWidth<=479&&$("[sidebar=beach-list]").css({transition:"none",transform:"translateX(0%)"}),$("[sidebar-toggle=beach-list]").removeClass("folded"),$("[sidebar=beach-list]").removeClass("folded"),$("[beach-toggle-icon=when-open]").show(),$("[beach-toggle-icon=when-closed]").hide()}function y(){window.scrollTo({top:0,behavior:"instant"}),$("[sidebar-toggle=beach-list]").addClass("folded"),$("[sidebar=beach-list]").addClass("folded"),$("[beach-toggle-icon=when-open]").hide(),$("[beach-toggle-icon=when-closed]").show()}function I(e){window.scrollTo({top:0,behavior:"instant"}),window.innerWidth<=479&&$("[sidebar=beach-list]").css({transition:"none",transform:"translateX(-100%)"}),$("[sidebar=beach]").show(),$("[sidebar="+e+"]").show(),$("[sidebar="+e+"]").parent().show()}function b(e){window.scrollTo({top:0,behavior:"instant"}),$("[sidebar=beach]").hide(),$("[sidebar="+e+"]").hide(),$("[sidebar="+e+"]").parent().hide()}function S(){window.history.pushState({},"",window.location.pathname),window.scrollTo({top:0,behavior:"instant"}),x(),y(),b(),$("[beach-item=container]").hide()}function M(){i.flyTo({center:n,zoom:t,pitch:o})}function L(){let e=i.getCenter();console.log(`Map center: ${e.lng}, ${e.lat}`)}function X(){let e=i.getZoom();console.log(`Map zoom level: ${e}`)}function A(){let e=i.getPitch();console.log(`Map pitch: ${e}`)}function R(){i.on("moveend",()=>{L(),X(),A()}),i.on("click",e=>{console.log(`${e.lngLat.lng}, ${e.lngLat.lat}`),console.log(e)})}function D(e){let r=a.get(e);r&&r.togglePopup()}function V(){a.forEach(e=>{let r=e.getPopup();r.isOpen()&&r.remove()})}}var w=class{constructor(t){this.container=t,this.svg=t.querySelector(".notch-svg"),this.path=t.querySelector(".dynamic-path"),this.notchButton=t.querySelector(".card_button"),this.rightEdge=304,this.points=[],this.controlPoints=[],this.bezierRelationships=[],this.originalPoints=[],this.originalControlPoints=[],this.initialize()}initialize(){let t=this.initializePath();this.setupResizeObserver()}initializePath(){let t=this.path.getAttribute("d").trim().split(/(?=[MmLlHhVvCcSsQqTtAaZz])/),n=0,o=0;return t.forEach(i=>{let a=i[0],s=i.slice(1).trim().split(/[\s,]+/).map(Number);switch(a){case"M":case"L":this.points.push({type:a,x:s[0],y:s[1]}),n++;break;case"C":this.controlPoints.push({x:s[0],y:s[1]},{x:s[2],y:s[3]}),this.points.push({type:a,x:s[4],y:s[5]}),this.bezierRelationships.push({pointIndex:n,controlPoints:[o,o+1]}),o+=2,n++;break}}),this.originalPoints=this.points.map(i=>({...i})),this.originalControlPoints=this.controlPoints.map(i=>({...i})),t}updatePath(){let t="",n=0,o=0;this.path.getAttribute("d").trim().split(/(?=[MmLlHhVvCcSsQqTtAaZz])/).forEach(a=>{let s=a[0];switch(s){case"M":case"L":t+=`${s}${this.points[n].x} ${this.points[n].y} `,n++;break;case"C":let c=this.controlPoints[o],l=this.controlPoints[o+1],d=this.points[n];t+=`${s}${c.x} ${c.y} ${l.x} ${l.y} ${d.x} ${d.y} `,o+=2,n++;break;default:t+=a+" "}}),this.path.setAttribute("d",t.trim())}updateNotchWidth(t){let n=t/this.notchButton.parentElement.offsetWidth*this.rightEdge,o=this.rightEdge-n,i=130;for(let a=7;a<=12;a++){let s=this.points[a].x;this.points[a].x=o+(this.originalPoints[a].x-(this.rightEdge-i));let c=this.bezierRelationships.find(l=>l.pointIndex===a);if(c){let[l,d]=c.controlPoints;this.controlPoints[l].x=o+(this.originalControlPoints[l].x-(this.rightEdge-i)),this.controlPoints[d].x=o+(this.originalControlPoints[d].x-(this.rightEdge-i))}}this.updatePath()}setupResizeObserver(){new ResizeObserver(n=>{for(let o of n)this.updateNotchWidth(o.contentRect.width)}).observe(this.notchButton)}};var g=class{constructor(t){if(this.containerId=t.containerId,this.prevBtnId=t.prevBtnId,this.nextBtnId=t.nextBtnId,this.stepSize=t.stepSize||1,this.maxItems=t.maxItems||null,this.itemWidth=t.itemWidth||"22rem",this.categoryUrl=t.categoryUrl||"#",this.container=document.getElementById(this.containerId),this.prevBtn=document.getElementById(this.prevBtnId),this.nextBtn=document.getElementById(this.nextBtnId),!this.container||!this.prevBtn||!this.nextBtn){console.error("Required elements not found");return}this.items=Array.from(this.container.children),this.maxItems&&this.items.length>this.maxItems&&(this.items=this.items.slice(0,this.maxItems),Array.from(this.container.children).slice(this.maxItems).forEach(l=>l.style.display="none"));let n=document.createElement("a");n.href=this.categoryUrl,n.classList.add("slider-last-card"),n.innerHTML="<h6>Go to Category</h6>";let o=document.createElement("div");o.appendChild(n),this.container.appendChild(o),this.items.push(o);let i=this.container.offsetWidth,a=parseFloat(this.itemWidth),s=this.itemWidth.replace(a.toString(),""),c;if(s==="rem")c=a*parseFloat(getComputedStyle(document.documentElement).fontSize);else if(s==="px")c=a;else{let l=document.createElement("div");l.style.width=this.itemWidth,document.body.appendChild(l),c=l.offsetWidth,document.body.removeChild(l)}if(this.itemsInView=Math.floor(i/c),this.items.length<=this.itemsInView){console.warn("Not enough items to create slider");return}this.currentIndex=0,this.touchStartX=0,this.touchEndX=0,this.currentTranslateX=0,this.isDragging=!1,this.startTranslateX=0,this.init()}init(){this.container.style.display="flex",this.container.style.overflow="visible",this.container.style.position="relative",this.container.style.userSelect="none",this.items.forEach((t,n)=>{if(t.style.flex=`0 0 ${this.itemWidth}`,t.style.transition="transform 0.3s ease-in-out",n===this.items.length-1){let o=t.querySelector("a");o&&(o.style.width="100%",o.style.margin="0rem")}}),this.prevBtn.addEventListener("click",t=>{t.preventDefault(),this.slide("prev")}),this.nextBtn.addEventListener("click",t=>{t.preventDefault(),this.slide("next")}),this.container.addEventListener("touchstart",t=>this.handleTouchStart(t)),this.container.addEventListener("touchmove",t=>this.handleTouchMove(t)),this.container.addEventListener("touchend",()=>this.handleTouchEnd()),this.updateButtonStates()}slide(t){t==="next"&&this.currentIndex<this.items.length-this.itemsInView?this.currentIndex=Math.min(this.currentIndex+this.stepSize,this.items.length-this.itemsInView):t==="prev"&&this.currentIndex>0&&(this.currentIndex=Math.max(0,this.currentIndex-this.stepSize)),this.updateSliderPosition(),this.updateButtonStates()}updateSliderPosition(){let t=parseFloat(this.itemWidth),n=this.itemWidth.replace(t.toString(),""),o;if(n==="rem")o=-(this.currentIndex*t*parseFloat(getComputedStyle(document.documentElement).fontSize));else if(n==="px")o=-(this.currentIndex*t);else{let i=document.createElement("div");i.style.width=this.itemWidth,document.body.appendChild(i),o=-(this.currentIndex*i.offsetWidth),document.body.removeChild(i)}this.currentTranslateX=o,this.items.forEach(i=>{i.style.transform=`translateX(${o}px)`})}updateButtonStates(){let t=this.currentIndex===0,n=this.currentIndex>=this.items.length-this.itemsInView;this.prevBtn.disabled=t,this.nextBtn.disabled=n,this.prevBtn.style.opacity=t?"0.3":"1",this.nextBtn.style.opacity=n?"0.3":"1"}handleTouchStart(t){this.isDragging=!0,this.touchStartX=t.touches[0].clientX,this.startTranslateX=this.currentTranslateX,this.items.forEach(n=>{n.style.transition="none"})}handleTouchMove(t){if(!this.isDragging)return;t.preventDefault(),this.touchEndX=t.touches[0].clientX;let n=this.touchEndX-this.touchStartX,o=this.startTranslateX+n,i=parseFloat(this.itemWidth),a=this.itemWidth.replace(i.toString(),""),s;if(a==="rem")s=i*parseFloat(getComputedStyle(document.documentElement).fontSize);else if(a==="px")s=i;else{let d=document.createElement("div");d.style.width=this.itemWidth,document.body.appendChild(d),s=d.offsetWidth,document.body.removeChild(d)}let c=0,l=-((this.items.length-this.itemsInView)*s);this.currentTranslateX=Math.max(l,Math.min(c,o)),this.items.forEach(d=>{d.style.transform=`translateX(${this.currentTranslateX}px)`})}handleTouchEnd(){if(!this.isDragging)return;this.isDragging=!1;let t=parseFloat(this.itemWidth),n=this.itemWidth.replace(t.toString(),""),o;if(n==="rem")o=t*parseFloat(getComputedStyle(document.documentElement).fontSize);else if(n==="px")o=t;else{let s=document.createElement("div");s.style.width=this.itemWidth,document.body.appendChild(s),o=s.offsetWidth,document.body.removeChild(s)}let i=Math.round(-this.currentTranslateX/(o/2)),a=Math.floor(-this.currentTranslateX/o);this.currentIndex=Math.max(0,Math.min(this.items.length-this.itemsInView,a)),this.items.forEach(s=>{s.style.transition="transform 0.3s ease-in-out"}),this.updateSliderPosition(),this.updateButtonStates()}};function U(){if(window.innerWidth>479){document.querySelectorAll(".path-container").forEach(t=>{new w(t)}),console.log("notch.js module loaded");return}}function F(){let f=new g({containerId:"slider-kiddos",prevBtnId:"prev-button-kiddos",nextBtnId:"next-button-kiddos",itemWidth:"22rem",stepSize:1,maxItems:10,categoryUrl:"/product-categories/kiddos"}),t=new g({containerId:"slider-sun",prevBtnId:"prev-button-sun",nextBtnId:"next-button-sun",itemWidth:"22rem",stepSize:1,maxItems:10,categoryUrl:"/product-categories/sun-protection"}),n=new g({containerId:"slider-transport",prevBtnId:"prev-button-transport",nextBtnId:"next-button-transport",itemWidth:"22rem",stepSize:1,maxItems:10,categoryUrl:"/product-categories/transport"});console.log("slider module loaded")}async function H(){console.log("init"),W(),F(),U()}H();})();
