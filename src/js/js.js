const fields = document.querySelectorAll('.col');
const cardRedactor = document.getElementById('cardRedactor');
const searchForm = document.getElementById('search');
const cardForm = document.getElementById('cardForm');
const page = document.querySelector('.page');
const url = 'https://jsonbox.io/box_b282a1326a5c5dba1ad1';
let fieldsObj = {};
let currentPopup = null;
let allCards = [];//here's put all cards

//cardRedactor form, cardBuilder
(function() {
    responseFullData().then((data)=>{
        if(data.length !== 0){
            createCard(allCards);
        }else{
            return
        }
    }).then(()=>{
        updateCardsCounter();
    }).then(()=>{
        page.classList.remove('page--loading');
    });

    cardForm.title.onchange = (e)=>{
        //when user tried sign card without title, gets error, and field will be highlighted,so this funct remove it if user fill it
        if(e.target.classList.contains('error')){
            e.target.classList.remove('error');
        }else if(e.target.value.length === 0){
            e.target.classList.add('error');
        }
    };

    window.addEventListener('click',e=>{
        if(e.target.hasAttribute('data-cardRedactor')){
            cardRedactor.className+= ' active';
            currentPopup = cardRedactor;

            if(e.target.dataset.cardredactor === 'redact'){
                let target = e.target;
                let card = e.target.closest('.card');
                let titleBlock = card.querySelector('.card__title');
                let descBlock = card.querySelector('.card__desc');
                let cardId = card.dataset.cardid;

                cardForm.title.value = titleBlock.innerText;
                cardForm.desc.value = descBlock.innerText;
                card.querySelectorAll('.card__label span').forEach(item=>{
                    cardForm.querySelector('.card__label--'+item.innerText+' input').checked = true;
                });

                cardForm.onsubmit = (e)=>{
                    e.preventDefault();
                    let labels = checkLabels(cardForm.labels);
                    let newObj = {
                        _id: cardId,
                        title: cardForm.title.value,
                        desc: cardForm.desc.value,
                        labels: labels,
                        status: target.closest('.col').dataset.status
                    };
                    updateData(newObj).then(()=>{
                        titleBlock.innerText = newObj.title;
                        descBlock.innerText = newObj.desc;
                        card.querySelector('.card__labels').innerHTML = buildLabels(newObj.labels);
                    }).then(()=>{
                        closeSuccess();
                    })
                }
            }else if(e.target.dataset.cardredactor === 'create' || e.target.dataset.cardredactor === 'createstatus'){
                let target = e.target;
                let method = target.dataset.cardredactor;
                let curStatus;
                if(method === 'createstatus'){
                    cardForm.className += ' status';
                }
                cardForm.onsubmit = (e)=> {
                    e.preventDefault();
                    // console.log([] = cardForm.status);
                    if(cardForm.title.value) {
                        if(method === 'create'){
                            curStatus = target.closest('.col').dataset.status;
                        }else if(method === 'createstatus'){
                            if(cardForm.status.value !== ''){
                                console.log('i here');
                                curStatus = cardForm.status.value;
                            }else{
                                cardForm.querySelector('.card-redactor__status-block').className += ' error';
                                return
                            }
                        }
                        let formData = {
                            title: cardForm.title.value,
                            desc: cardForm.desc.value,
                            labels: checkLabels(cardForm.labels),
                            status: curStatus
                        };
                        setData(formData).then(data=>{
                            allCards.push(data);
                            createCard(data);
                            updateCardsCounter();
                        }).then(()=>{
                            closeSuccess();
                        })
                    }else{
                        if(!cardForm.title.classList.contains('error')){
                            console.log('here title error');
                            cardForm.title.className += ' error';
                        }
                    }

                }
            }

        }
        if(e.target.hasAttribute('data-popupclose')){
            closePopup();
            clearRedactForm();
        }
    });

    searchForm.addEventListener('input',(e)=>{
        e.preventDefault();
        let renderArray = [];
        let text = searchForm.search.value.toLowerCase();
        if(text.length > 0){
            clearDesk();
            for(let i = 0, l = allCards.length; i < l; i++){
                if(allCards[i].title.toLowerCase().match(text) ||
                    allCards[i].desc.toLowerCase().match(text) ||
                    allCards[i].labels.some(item => item.toLowerCase().match(text))){
                    console.log(allCards[i].title);
                    renderArray.push(allCards[i]);
                }
            }
            createCard(renderArray);
        }else if(text.length === 0){
            clearDesk();
            createCard(allCards);
        }
    });

    function createCard(data){
        console.log(typeof data,data);
        if(data.length > 0 && data !=='string'){
            let statusEvaluation = '';
            let statusBacklog = '';
            let statusSelected = '';
            let statusRunning = '';
            let statusLive = '';
            data.forEach(item=>{
                if(item.status === 'backlog') statusBacklog += buildCard(item);
                if(item.status === 'evaluation')statusEvaluation += buildCard(item);
                if(item.status === 'live')statusLive += buildCard(item);
                if(item.status === 'running')statusRunning += buildCard(item);
                if(item.status === 'selected')statusSelected += buildCard(item);
            });
            fieldsObj.backlog.contentBlock.insertAdjacentHTML('beforeend',statusBacklog);
            fieldsObj.selected.contentBlock.insertAdjacentHTML('beforeend',statusSelected);
            fieldsObj.running.contentBlock.insertAdjacentHTML('beforeend',statusRunning);
            fieldsObj.evaluation.contentBlock.insertAdjacentHTML('beforeend',statusEvaluation);
            fieldsObj.live.contentBlock.insertAdjacentHTML('beforeend',statusLive);
        }else if(typeof data === 'object'){
            fieldsObj[data.status].contentBlock.insertAdjacentHTML('beforeend',(buildCard(data)));
        }
    }

    function buildCard(cardObj){
        let cardHtml =
            '<div class="card" draggable="true" data-cardid="'+cardObj._id+'">'+
            '<p class="card__title">' + cardObj.title +
            '</p>'+
            '<div class="card__sett" data-cardRedactor="redact"><svg><use xlink:href="#iconConfig"></use></svg></div>'+
            '<p class="card__desc">'+ cardObj.desc +'</p>' +
            '<div class="card__labels">'+
            buildLabels(cardObj.labels) +
            '</div>'+
            '</div>';
        return cardHtml;
    };

    function buildLabels(labelsArr){
        let labelsHtml = '';
        labelsArr.forEach((item)=>{
            labelsHtml +=
                '<div class="card__label card__label--'+item+'">'+
                '<span>'+item+'</span>'+
                '</div>'
        });
        return labelsHtml;
    };

    function checkLabels(labels){
        let labelsChecked = [];
        if(labels.length > 0 && typeof(labels) !== 'string'){
            labels.forEach((item)=>{
                if(item.checked) labelsChecked.push(item.value);
            });
            return labelsChecked;
        }else return []

    }

    function closeSuccess() {
        cardRedactor.className+= ' success';
        setTimeout(()=>{
            clearRedactForm();
            closePopup();
            cardRedactor.classList.remove('success');
        },500)
    }

    function clearDesk(){
        fieldsObj.selected.contentBlock.innerHTML ='';
        fieldsObj.backlog.contentBlock.innerHTML ='';
        fieldsObj.running.contentBlock.innerHTML ='';
        fieldsObj.evaluation.contentBlock.innerHTML ='';
        fieldsObj.live.contentBlock.innerHTML ='';
    }

})();

//dragging
(function () {

    let currentDragItem = null;

    fields.forEach(function(field){
        let key = field.dataset.status;
        fieldsObj[key] = {//here's the object witch is accessible in all functions, to get exact field
            block: field,
            contentBlock: field.querySelector('.col__content'),
            counter: field.querySelector('.col__counter')
        };
        console.log(fieldsObj.backlog.contentBlock);
        field.addEventListener('dragenter',dragEnter,true);
        field.addEventListener('dragleave',dragLeave);
        field.addEventListener('dragover',function(e){
            e.preventDefault();
        });
        field.addEventListener('drop', dragdrop);

    });

    window.addEventListener('mousedown',(e)=>{
        if(e.target.draggable ||  e.target.closest('.card')){//if element draggable ,it get eventListeners prescribed below
            var target = e.target.closest('.card');
            currentDragItem = target;//el puts in variable to be accessed from main lexical environment
            target.addEventListener('dragstart',(event)=>{
                dragStart(target);
                event.dataTransfer.setData('Text', this.id);
            });
            target.addEventListener('dragend', dragEnd);
        }
    });

    window.addEventListener('mouseup',()=>{
        if(currentDragItem){//when drag ended and user mouseuped, evenListeners removes
            currentDragItem.removeEventListener('dragstart',dragStart);
            setTimeout(()=>{
                currentDragItem = null;
            },0);
        }
    });

    function dragStart(el){
        el.className +=' hold';
        setTimeout(function(){
            el.className += ' invisible';
        },0)
    }

    function dragEnd(el) {
        currentDragItem.classList.remove('invisible','hold');
        currentDragItem.removeEventListener('dragend',dragEnd);

    }

    function dragEnter(e) {
        this.className +=' misty';
    }

    function dragLeave() {
        this.classList.remove('misty');
    }

    function dragdrop(){
        this.querySelector('[data-container]').append(currentDragItem);
        this.classList.remove('misty');
        updateCardsCounter();
        chengeStatus(currentDragItem,this.dataset.status);
    }
})();



function closePopup(){
    currentPopup.classList.remove('active');
    clearFormErrors(currentPopup.querySelector('form'));
    currentPopup = null;
}

function clearFormErrors(form){
    form.querySelectorAll('.error').forEach(item=>{
        item.classList.remove('error');
    });
}

function updateCardsCounter() {
    console.log(fieldsObj.selected.contentBlock.childElementCount);
    fieldsObj.selected.counter.innerText =   fieldsObj.selected.contentBlock.childElementCount;
    fieldsObj.backlog.counter.innerText =    fieldsObj.backlog.contentBlock.childElementCount;
    fieldsObj.running.counter.innerText =    fieldsObj.running.contentBlock.childElementCount;
    fieldsObj.evaluation.counter.innerText = fieldsObj.evaluation.contentBlock.childElementCount;
    fieldsObj.live.counter.innerText =       fieldsObj.live.contentBlock.childElementCount;
}

function chengeStatus(cardBlock,status){
    for(let i = 0, l = allCards.length; i < l; i++){
        if(allCards[i]._id === cardBlock.dataset.cardid){
            allCards[i].status = status;
            updateData(allCards[i]);
        }
    }
}

function updateClientCard(cardObj){
    for(let i = 0,l = allCards.length; i < l; i++ ){
        if(allCards[i]._id === cardObj._id){
            return Object.assign(allCards[i], cardObj);
        }
    }
}

function clearRedactForm(){
    cardForm.title.value = '';
    cardForm.desc.value = '';
    cardForm.className = 'card-redactor__form';
    cardForm.labels.forEach(item =>{
        if(item.checked){
            item.checked = false
        }
    });
    cardForm.status.forEach(item =>{
        if(item.checked){
            item.checked = false
        }
    });
}

function responseFullData(){
    return fetch(url,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then((response)=>{
            return response.json()
        })
        .then((data)=>{
            allCards = data;
            return data
        })
        .catch(error => {
            console.log(error);

        })
}

function updateData(cardObj){
    return fetch(url+'/'+cardObj._id,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cardObj)
    }).then((response) =>{
        updateClientCard(cardObj);
    })
        .catch(error => {
            console.log(error);
            return false
        })
}

function setData(send){
    return fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(send)
    })
        .then((response)=>{
            return response.json();
        })
        .then(data=>{
            return data
        })
        .catch(error => {
            console.log(error);
            return false
        })

};

function deleteData(itemId){
    console.log(itemId);
    fetch(url +'/'+ itemId,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .catch(error => {
            console.log(error);
        });
}
