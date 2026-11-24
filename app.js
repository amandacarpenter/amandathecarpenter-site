(function(){
  // Header border on scroll
  var header=document.querySelector('.site-header');
  var onScroll=function(){header.classList.toggle('scrolled',window.scrollY>8)};
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Mobile menu
  var menuBtn=document.querySelector('.menu-btn'),navList=document.getElementById('nav-list');
  menuBtn.addEventListener('click',function(){
    var open=menuBtn.getAttribute('aria-expanded')==='true';
    menuBtn.setAttribute('aria-expanded',String(!open));navList.classList.toggle('open',!open);
  });
  navList.addEventListener('click',function(e){
    if(e.target.closest('a')){menuBtn.setAttribute('aria-expanded','false');navList.classList.remove('open')}
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&navList.classList.contains('open')){menuBtn.setAttribute('aria-expanded','false');navList.classList.remove('open');menuBtn.focus()}
  });

  // Logo marquee: duplicate for seamless loop, pause control
  var track=document.getElementById('logo-track');
  Array.prototype.slice.call(track.children).forEach(function(li){
    var c=li.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelector('img').alt='';track.appendChild(c);
  });
  var marquee=document.querySelector('.marquee'),toggle=document.querySelector('.marquee-toggle'),tText=toggle.querySelector('.toggle-text');
  toggle.addEventListener('click',function(){
    var paused=toggle.getAttribute('aria-pressed')==='true';
    toggle.setAttribute('aria-pressed',String(!paused));marquee.classList.toggle('paused',!paused);
    tText.textContent=paused?'Pause logos':'Play logos';
  });

  // Tabs
  var tabs=Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab,focus){
    tabs.forEach(function(t){
      var on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;
      document.getElementById(t.getAttribute('aria-controls')).hidden=!on;
    });
    if(focus)tab.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){select(t)});
    t.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowRight')n=tabs[(i+1)%tabs.length];
      else if(e.key==='ArrowLeft')n=tabs[(i-1+tabs.length)%tabs.length];
      else if(e.key==='Home')n=tabs[0];
      else if(e.key==='End')n=tabs[tabs.length-1];
      if(n){e.preventDefault();select(n,true)}
    });
  });

  // Click-to-play YouTube
  document.querySelectorAll('.yt').forEach(function(box){
    box.querySelector('.yt-play').addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+box.dataset.id+'?autoplay=1&rel=0';
      f.title=box.dataset.title;
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen=true;
      box.innerHTML='';box.appendChild(f);f.focus();
    });
  });

  // Contact form
  var form=document.getElementById('contact-form'),status=document.getElementById('form-status'),fName=document.getElementById('f-name');
  var ep=['aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgv','YW1hbmRhdGhlY2FycGVudGVyQGdtYWlsLmNvbQ=='];
  function setErr(input,msg){
    var e=document.getElementById('e-'+input.id.replace('f-',''));
    if(msg){input.setAttribute('aria-invalid','true');if(e)e.textContent=msg}
    else{input.removeAttribute('aria-invalid');if(e)e.textContent=''}
  }
  function validate(){
    var ok=true,first=null;
    var name=fName,email=form.email,msg=form.message;
    if(!name.value.trim()){setErr(name,'Please enter your name.');ok=false;first=first||name}else setErr(name);
    if(!email.value.trim()){setErr(email,'Please enter your email address.');ok=false;first=first||email}
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){setErr(email,'Please enter a valid email, like name@example.com.');ok=false;first=first||email}
    else setErr(email);
    if(!msg.value.trim()){setErr(msg,'Please add a few details about your project.');ok=false;first=first||msg}else setErr(msg);
    if(first)first.focus();
    return ok;
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    status.className='form-status field-full';status.textContent='';
    if(!validate())return;
    if(form._honey.value)return;
    var btn=form.querySelector('button[type="submit"]');btn.disabled=true;
    var data={
      name:fName.value.trim(),email:form.email.value.trim(),
      organization:form.organization.value.trim(),service:form.service.value,
      message:form.message.value.trim(),
      _subject:'New website inquiry from '+fName.value.trim(),
      _replyto:form.email.value.trim(),_template:'table',_captcha:'false'
    };
    fetch(atob(ep[0])+atob(ep[1]),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(j){return {ok:r.ok,j:j}})})
      .then(function(res){
        if(res.ok&&String(res.j.success)!=='false'){
          status.classList.add('ok');status.textContent='Thanks, your message was sent. Amanda will be in touch soon.';form.reset();
        }else{throw new Error(res.j.message||'Send failed')}
      })
      .catch(function(){
        status.classList.add('bad');status.textContent='Sorry, something went wrong and your message was not sent. Please try again, or reach out on LinkedIn.';
      })
      .finally(function(){btn.disabled=false});
  });

  // Reveal on scroll (content stays visible without JS)
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var els=document.querySelectorAll('.section-head,.service,.creds .cred-block,.contact-grid > *');
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
    },{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<window.innerHeight){return}
      el.classList.add('reveal');io.observe(el);
    });
  }
})();
