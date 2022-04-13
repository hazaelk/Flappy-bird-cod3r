// PREENCHENDO O CONTEUDO DO JOGO ATRAVES DO JS

 /* 1º definiremos uma função para executar uma 
            tarefa corriqueira: criar um novo elemento */
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

/* 2º função construtora da barreira */
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira') //this.elemento = a barreira no contexto
                                                    //'div' com classe 'barreira' passado 
                                                    // param para a func criada acima
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)
                            //aqui estou perguntando se 'reverse' é falso ou verdadeiro
                            //para criar elemento na posição correta (acima ou abaixo)
                            //se reverse = falso => linha17 = (borda) linha18 = (corpo)
                            //se reverse = verdad => linha17 = (corpo) linha18 = (borda)
    
/* 3º altura da barreira variará! */
    this.setAltura = altura => corpo.style.height = `${altura}px`
}
 //teste
// const b = new Barreira(true) se true então primeiro corpo depois a borda, vai ficar em cima
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

/* 4º spawnar barreiras */
function ParDeBarreiras(altura, abertura, x) { //altura da barreira, abertura (justify content), x posição na horizontal (element.clientX) da barreira
    this.elemento = novoElemento('div', 'par-de-barreiras')
    
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
        // this.superior e this.inferior são publicos 
        // para futuramente calcularmos a colisão do pássaro

    this.elemento.appendChild(this.superior.elemento) 
    this.elemento.appendChild(this.inferior.elemento)
                                //.elemento é quem de fato será inserido na dom

/* 5º sortear abertura aleatoriamente */
    this.sortearAbertura = () => { // publico
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior //lê denovo, não é dificil
        //console.log(alturaSuperior)
        //console.log(alturaInferior)
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    
/* 6º função return posição da barreira 
    fazendo split em (elemento.style.left) "px",    elemento este onde está sendo invocada a func
        pegando 1º posição e 
            obtendo array, 
                fazendo então um parseInt */
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    
/* 7º criando possibilidade de setar posição no eixo X da barreira, para q ela se mova */
    this.setX = x => this.elemento.style.left = `${x}px`

/* 8º obter largura da tela */
    this.getLargura = () => this.elemento.clientWidth

/*  PARA TERMINAR ESSA FUNÇÃO MAIOR, EU QUERO ANTES:    */
           // 1. sortear a primeira abertura:
            this.sortearAbertura()
           // 2. setar o 'x' recebido como parâmetro
           this.setX(x)
// IMPORTANTE* AS TRES FUNCS ACIMA SÃO PUBLICAS POR CONTA DO THIS.
}

//teste
//const b = new ParDeBarreiras(700, 200, 800) //700 é altura do jogo 200 pixels da abertura das divs(onde passaro vai passar) 500posição barreira eixo x
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [ //momento inicial do jogo
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da tela
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            
            //notificar ponto qnd a barreira cruzar o meio da div(jogo)
            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false
    
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'passaro.png'
    
    //saber altura do passaro
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    
    //setar altura do passaro
    this.setY = y => this.elemento.style.bottom = `${y}px`

    //identificar se o user apertou e soltou a tecla, passando o valor da var let "voando"
    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    //animação
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5) //se voando for verdade add 8px no bottom
                                                //se for falso, tira -5 da posição em relação ao bottom
        const alturaMaxima = alturaJogo - this.elemento.clientHeight
    
        if (novoY <=0) {
            this.setY(0) //altura min = 0
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima) // altura max
        } else {
            this.setY(novoY)
        }
        
    }

    this.setY(alturaJogo / 2)
}


function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

//checagem de colisão
function estaoSobrepostos(elementoA, elementoB) {
    //pegando dimensões necessárias para calcular a colisão
    //lembrar que pra colidir é crucial ser eixo X e eixo Y
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    /* "se a esquerda de 'a' mais a largura dele é maior que
    a esquerda de 'b' pode ser uma colisão
    mesma filosofia pra b" */
    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(ParDeBarreiras => {
        if(!colidiu) {
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    //obter dados que serao usados
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    // criar elementos
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos)) //função que vai notificar o ponto

    const passaro = new Passaro(altura)

    ///colocar na tela
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }

        }, 20)
    }
}

new FlappyBird().start()



//teste
// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento )
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)
