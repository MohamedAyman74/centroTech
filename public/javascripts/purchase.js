const tab = document.querySelectorAll('.tab')
const visa = document.querySelector('.visa-details')
const vodafone = document.querySelector('.vodafone')
const fawry = document.querySelector('.fawry')
const aman = document.querySelector('.aman')
for (let i = 0; i <= 3; i++) {
    tab[i].onclick = function () {
        tab[i].classList.toggle('active')
        for (let j = 0; j <= 3; j++) {
            if (j !== i) {
                tab[j].classList.remove('active')
            }
        }
    }
}

if (tab[0].classList.contains('active')) {
    vodafone.classList.add('hide')
    fawry.classList.add('hide')
    aman.classList.add('hide')
}


tab[0].addEventListener('click', () => {
    visa.classList.remove('hide')
    vodafone.classList.add('hide')
    fawry.classList.add('hide')
    aman.classList.add('hide')

})


tab[1].addEventListener('click', () => {
    visa.classList.add('hide')
    fawry.classList.add('hide')
    aman.classList.add('hide')
    vodafone.classList.remove('hide')
})

tab[2].addEventListener('click', () => {
    fawry.classList.remove('hide')
    vodafone.classList.add('hide')
    aman.classList.add('hide')
    visa.classList.add('hide')
})
tab[3].addEventListener('click', () => {
    aman.classList.remove('hide')
    vodafone.classList.add('hide')
    fawry.classList.add('hide')
    visa.classList.add('hide')
})