const fields = document.querySelectorAll('.col');
const cardRedactor = document.getElementById('cardRedactor');
const cardForm = document.getElementById('cardForm');
const url = 'https://jsonbox.io/box_b282a1326a5c5dba1ad1';
let fieldsObj = {};
let currentPopup = null;
let allCards = [];

function autoGrow(element) {
    element.style.height = '5px';
    element.style.height = element.scrollHeight + 8 + "px";
}

//dragging
(function () {
    let currentDragItem = null;
    fields.forEach(function(field){
        field.addEventListener('dragenter',dragEnter);
        field.addEventListener('dragleave',dragLeave);
        field.addEventListener('dragover',function(e){
            e.preventDefault();
        });
        console.log(field);
        let key = field.className.replace('col col--','');
        field.addEventListener('drop', dragdrop);
        fieldsObj[key] = field;
    });
    console.log(fieldsObj);
    window.addEventListener('mousedown',(e)=>{
        if(e.target.draggable ||  e.target.closest('.card')){//if element draggable ,it get eventListeners prescribed below
            var target = e.target.closest('.card');
            currentDragItem = target;//el puts in variable to be accessed from main lexical environment
            target.addEventListener('dragstart',()=>{
                dragStart(target);
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
    function dragEnter() {
        this.className +=' misty';
    }
    function dragLeave() {
        this.classList.remove('misty');
    }
    function dragdrop(){
        this.querySelector('[data-container]').append(currentDragItem);
        this.classList.remove('misty');
    }
})();
//cardRedactor form, cardBuilder
(function() {
    cardForm.title.onchange = (e)=>{
        //when user tried sign card without title, he(she) gets error, and highlight field, this fun remove it
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
                let card = e.target.closest('.card');
                let titleBlock = card.querySelector('.card__title');
                let descBlock = card.querySelector('.card__desc');
                cardForm.title.value = titleBlock.innerText;
                cardForm.desc.value = descBlock.innerText;
                card.querySelectorAll('.card__label span').forEach(item=>{
                    cardForm.querySelector('.card__label--'+item.innerText+' input').checked = true;
                });
                cardForm.onsubmit = (e)=>{
                    e.preventDefault();
                    titleBlock.innerText = cardForm.title.value;
                    descBlock.innerText = cardForm.desc.value;
                    card.querySelector('.card__labels').innerHTML = buildLabels(checkLabels(cardForm.labels));
                    clearRedactForm();
                    closePopup();
                }
            }else if(e.target.dataset.cardredactor === 'create'){
                console.log('create');
                let target = e.target;
                cardForm.onsubmit = (e)=> {
                    e.preventDefault();
                    if(cardForm.title.value) {
                        let formData = {
                            title: cardForm.title.value,
                            desc: cardForm.desc.value,
                            labels: checkLabels(cardForm.labels),
                            status: target.closest('.col').dataset.col
                        };
                        setData(formData);
                        createCard(formData);
                        console.log(target.closest('.col'));
                        clearRedactForm();
                        closePopup();
                    }else{
                        if(!cardForm.title.classList.contains('error')){
                            cardForm.title.className += 'error';
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


    resposeFullData();
    setTimeout(()=>{
        console.log(typeof allCards);
        createCard(allCards);

        allCards.forEach(item=>{
            // deleteData(item._id);
        })
    },1000);
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
            fieldsObj.backlog.querySelector('.col__content').insertAdjacentHTML('beforeend',statusBacklog);
            fieldsObj.selected.querySelector('.col__content').insertAdjacentHTML('beforeend',statusSelected);
            fieldsObj.running.querySelector('.col__content').insertAdjacentHTML('beforeend',statusRunning);
            fieldsObj.evaluation.querySelector('.col__content').insertAdjacentHTML('beforeend',statusEvaluation);
            fieldsObj.live.querySelector('.col__content').insertAdjacentHTML('beforeend',statusLive);
        }else if(typeof data === 'object'){
            fieldsObj[data.status].querySelector('.col__content').insertAdjacentHTML('beforeend',(buildCard(data)));
        }


    }
    function buildCard(cardObj){
        let cardHtml =
            '<div class="card" draggable="true" data-card>'+
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
})();
function closePopup(){
    currentPopup.classList.remove('active');
    currentPopup = null;
};

function clearRedactForm(){
    cardForm.title.value = '';
    cardForm.desc.value = '';
    cardForm.labels.forEach(item =>{
        if(item.checked){
            item.checked = false
        }
    });
}
;

function resposeFullData(){
    fetch(url,{
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
        })
        .catch(error => {
            console.log(error);

        })
};

function updateData(){};
function setData(send){
    fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(send)
    })
        .then((response)=>{
            return response.json();
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
        .then((response)=>{
            return response.json()
        })
        .then((data)=>{

        })
        .catch(error => {
            console.log(error);

        });
}
