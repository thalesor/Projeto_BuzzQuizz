      //Em primeiro lugar, nós tinhamos que definir o objeto no storage que ia guardar os quizzes do usuário
          let quizzesUsuario;
          if(!localStorage.getItem("quizzesUsuario"))
          {
              let quizzesUsuario = [];
              localStorage.setItem("quizzesUsuario", JSON.stringify(quizzesUsuario));
          }
          else
          quizzesUsuario = JSON.parse(localStorage.getItem("quizzesUsuario"));
      //fim do storage


       //Aqui ficam as variáveis globais que serão usadas nas funções
       let route = "home";
       let quantidadePerguntasForm = null;
       let quantidadeNiveisForm = null;
       let quizzId;
       
       let quizz = {
        title: null,
        image: null,
        questions: [],
        levels: []
       };
       
       //Definição do componente quizz(visual)
       const Quizz = (title, image, id) =>
       {
           
            let quizzBody = `<a data-identifier="quizz-card" onclick=getQuizz(${id})>
            <li class="quizz">
                <img alt="${id}" src="${image}">
                <span>${title}</span>
            </li>
        </a>`;

           return quizzBody;
       }

       //Função que retorna os quizzes do usuário mas somente se esses estiverem na lista dos últimos quizzes da API
       const getQuizzesUsuario = () =>
       {   
           axios.get("https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes")
           .then(response  => 
           {
               const quizzes = response.data;
               const listaQuizzes = quizzes.map((quizz) => 
               {
                   if(quizzesUsuario.includes(quizz.id))
                  return Quizz(quizz.title, quizz.image, quizz.id); 
               })
               .join("");
               document.querySelector(".quizz-usuario").innerHTML = listaQuizzes;
           }).finally(() => turnOverlay("remove"));
       }

       //Função que retorna os últimos 50 quizzes(ou algo assim) da API, somente os que não são do usuário
        const getQuizzes = () =>
       {   
           axios.get("https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes")
           .then(response  => 
           {
               const quizzes = response.data;
               const listaQuizzes = quizzes.map((quizz) => 
               {
                    if(!quizzesUsuario.includes(quizz.id))
                  return Quizz(quizz.title, quizz.image, quizz.id);  
               })
               .join("");
               document.querySelector(".quizz-todos").innerHTML = listaQuizzes;
           }).finally(() => turnOverlay("remove"));
       }

       //Função que renderiza um formulário de pergunta
       const renderPerguntaForm = (number) =>
        {
            let form =  `
            <a data-identifier="expand" class="collapsible">
            <span>Pergunta ${number}</span><ion-icon name="create-outline">
            </a>
            <form data-identifier="question" class="form-collapsible">
            <input oninvalid="validarInput(this);" type="text" minlength="20" placeholder="     Texto da pergunta" class="pergunta-texto" required />
            <small class="hidden">O campo texto da pergunta não pode ser vazio e deve ter um número de caracteres a partir de 20</small>

            <input oninvalid="validarInput(this);" type="text" placeholder="     A Cor de fundo da pergunta" class="pergunta-cor" pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" required />
            <small class="hidden">O campo cor de fundo da pergunta deve ser um hexadecimal válido</small>
            <h3>Resposta correta</h3>
            <input oninvalid="validarInput(this);" type="text" placeholder="     Resposta correta " class="resposta-correta" required/>
            <small class="hidden">O campo da resposta correta não pode ficar vazio</small>
            
            <input oninvalid="validarInput(this);" type="url" placeholder="     URL da imagem" class="url-imagem-correta" required/>
            <small class="hidden">O campo imagem da resposta correta deve ser uma URL válida</small>
            <h3>Respostas incorretas</h3>
            <div class="group">
            <input oninvalid="validarInput(this);" type="text" placeholder="     Resposta incorreta 1" class="resposta-incorreta-1" required />
            <small class="hidden">Pelo menos uma resposta incorreta deve ser adicionada</small>

            <input oninvalid="validarInput(this);" type="url" placeholder="     URL da imagem 1" class="url-imagem-incorreta-1" required/>
            <small class="hidden">Pelo menos a imagem de uma resposta incorreta deve ser uma URL válida</small>
            </div>
            <div class="group">
            <input type="text" placeholder="     Resposta incorreta 2" class="resposta-incorreta-2"/>
            <input type="url" placeholder="     URL da imagem 2" class="url-imagem-incorreta-2"/>
            </div>
            <div class="group">
            <input type="text" placeholder="     Resposta incorreta 3" class="resposta-incorreta-3"/>
            <input type="url" placeholder="     URL da imagem 3" class="url-imagem-incorreta-3"/>
            </div>
            </form>`;
                let container =  document.querySelector(".container-perguntas");
                container.insertAdjacentHTML("beforeend", form);
        }

        //Função que renderiza um formulário de nível
        const renderNivelForm = (number) =>
        {
            let campoAcerto;
            if(number === 1)
            {
              campoAcerto = `<input oninvalid="validarInput(this);" type="number" placeholder="     % de acerto mínima" min="0" max="0" class="acerto-nivel" required />
              <small class="hidden">O campo da porcentagem de acerto do primeiro nível deve ser obrigatoriamente a partir dos 0% de acerto</small>`;
            }
            else 
            campoAcerto = `<input oninvalid="validarInput(this);" type="number" placeholder="     % de acerto mínima" min="10" max="100" class="acerto-nivel" required />
            <small class="hidden">O campo da porcentagem de acerto do nível não pode ser vazio e deve ser a partir dos 10% de acerto</small>`;
              let form =  `
              <a data-identifier="expand" class="collapsible">
              <span>Nível ${number}</span><ion-icon name="create-outline">
              </a>
              <form data-identifier="level" class="form-collapsible">
              <input oninvalid="validarInput(this);" type="text" minlength="10" placeholder="     Título do nível" class="titulo-nivel" required />
              <small class="hidden">O campo título do nível não pode ser vazio e deve ter um número de caracteres a partir de 10</small>

              ${campoAcerto}

              <input oninvalid="validarInput(this);" type="url" placeholder="     URL da imagem do seu quizz" class="url-imagem-nivel" required />
              <small class="hidden">O campo da imagem do nível deve ser uma URL válida</small>

              <input oninvalid="validarInput(this);" type="text" minlength="30" placeholder="     Descrição do nível" class="descricao-nivel" required />
              <small class="hidden">O campo descrição do nível não pode ser vazio e deve ter um número de caracteres a partir de 30</small>
              </div>
              </form>`;

                let container =  document.querySelector(".container-niveis");
                container.insertAdjacentHTML("beforeend", form);
        }

        //Função que reseta as variáveis globais de criação de quizz, caso dê erro na crição do quizz
        const resetQuizz = () =>
        {
            let quantidadePerguntasForm = 0;
            let quantidadeNiveisForm = 0;
            let idQuizz = null;
            let quizz = {
            title: null,
            image: null,
            questions: [],
            levels: []
            };
        }

        //Função que guarda um quizz no storage
        const guardaStorage = (idQuizz) =>
        {
            quizzesUsuario = JSON.parse(localStorage.getItem("quizzesUsuario"));
            quizzesUsuario.push(idQuizz);
            localStorage.setItem("quizzesUsuario", JSON.stringify(quizzesUsuario));
        }
       
        //Função que adiciona mensagens de erro aos inputs
        const validarInput = (elemento) => 
        {
          elemento.nextElementSibling.classList.remove("hidden");
        }

        //Função chamada ao submeter um formulário, mesmo se for de quizz, pergunta ou níveis
        const submit = () => 
        {
            let forms = document.querySelectorAll("form");
            forms =  Array.from(forms);  
            let isValid = true;
            forms.forEach(f => {
            if (!f.checkValidity()) 
            {
                isValid = false;
            }
             });
            if(isValid)
            {
                if(route === "quizz")
                {
                    quizz.title = forms[0].querySelector('.quizz-title').value;
                    quizz.image = forms[0].querySelector('.url-image-quizz').value;
                    quantidadePerguntasForm = forms[0].querySelector('.number-asks-quizz').value;
                    quantidadeNiveisForm = forms[0].querySelector('.number-levels-quizz').value;
                    redirect("perguntas");
                }
                else if(route === "perguntas")
                {
                    forms.forEach(f => {
                        let question = {
                            title: f.querySelector('.pergunta-texto').value,
                            color: f.querySelector('.pergunta-cor').value,
                            answers: null
                        };
                        let answers = [];
                        answers.push(
                            {
                                text: f.querySelector('.resposta-correta').value,
                                image: f.querySelector('.url-imagem-correta').value,
                                isCorrectAnswer: true
                            });
                            
                            let respostasIncorretas = f.querySelectorAll(".group");
                            respostasIncorretas = Array.from(respostasIncorretas);
                            respostasIncorretas.forEach(resposta => 
                            {
                                let textoIncorreto = resposta.querySelector('input[type="text"]').value;
                                let imagemIncorreta = resposta.querySelector('input[type="url"]').value;
                                if(textoIncorreto !== "" && imagemIncorreta != "")
                                {
                                    answers.push(
                                        {
                                            text: textoIncorreto,
                                            image: imagemIncorreta,
                                            isCorrectAnswer: false
                                        });
                                }    
                            });

                            question.answers = answers;
                            quizz.questions.push(question);   
                    });
                    redirect("niveis");
                }
                else if(route === "niveis")
                {
                    
                    forms.forEach(f => {
                        let level = {
                            title: f.querySelector('.titulo-nivel').value,
                            image: f.querySelector('.url-imagem-nivel').value,
                            text: f.querySelector('.descricao-nivel').value,
                            minValue: f.querySelector('.acerto-nivel').value
                        };
                        quizz.levels.push(level);
                    });
                     redirect("submit"); 
                 }
            }
        }

        //Função que renderiza todo o html do site, baseado na variável global route
        const renderView = (route) => 
        {
            if(route === "home")
            {
               let viewUsuario;
                if(quizzesUsuario.length)
                viewUsuario = `
                <div class="flex">
                    <h1>Seus quizzes</h1>
                    <a data-identifier="create-quizz" onclick='redirect("quizz");'><ion-icon name="add-circle"></ion-icon>
                    </a>
                </div>
                <ul data-identifier="user-quizzes" class="quizz-usuario"></ul>
                `;
                else
                viewUsuario = `
                <div class="painel-usuario">
                    <span>Você não criou nenhum quizz ainda :(</span>
                    <a data-identifier="create-quizz" onclick='redirect("quizz");'><p>Criar Quizz</p></a>
                </div>
                `;

                return `
                <div class="container-home">
                <form class="form-home" novalidate>
                  <div>
                    <input type="number" placeholder="      ID do quizz que deseja buscar" oninvalid="validarInput(this);" min="0" class="idQUizzInput"  required />
                    <small class="hidden">Para buscar um quizz, o campo não pode estar vazio</small>
                  </div>
                  <a onclick="getQuizzInput()">Buscar</a>
                </form>
                ${viewUsuario}
                <h1>Todos os quizzes</h1>
                <ul data-identifier="general-quizzes" class="quizz-todos"></ul>
            </div>
                `;
            }
            else if(route === "quizz")
            return `
            <h2>Comece pelo começo</h2>
            <form novalidate>
                
                <input type="text" minlength="20" oninvalid="validarInput(this);" maxlength="65" placeholder="      Título do quizz" class="quizz-title" required />
                <small class="hidden">O campo título do quizz não pode ser vazio e deve ter um número de caracteres entre 20 e 65</small>
                
                
                <input type="url" oninvalid="validarInput(this);" placeholder="     URL da imagem do seu quizz" class="url-image-quizz" required />
                <small class="hidden">O campo imagem do quizz deve ser uma URL válida</small>
                
                
                <input type="number" oninvalid="validarInput(this);" placeholder="     Quantidade de perguntas do quizz" min="3" class="number-asks-quizz" required />
                <small class="hidden">O campo quantidade de perguntas do quizz deve ter o valor mínimo de 3</small>
                
                
                <input type="number" oninvalid="validarInput(this);" placeholder="     Quantidade de níveis do quizz" min="2" class="number-levels-quizz" required />
                <small class="hidden">O campo quantidade de níveis do quizz deve ter o valor mínimo de 2</small>
                
            </form>
            <a class="submit" onclick="submit()">Prosseguir pra criar perguntas</a>
            `;
            else if(route === "perguntas")
            return `
            <h2>Crie suas perguntas</h2>
            <div class="container-perguntas">
            </div>
            <a class="submit" onclick="submit()">Prosseguir pra criar níveis</a>
        `;
        else if(route === "niveis")
            return `
            <h2>Agora, decida os níveis</h2>
            <div class="container-niveis">
            </div>
            <a class="submit" onclick="submit()">Finalizar quizz</a>
            `;
            else if(route === "success")
            return `
            <h2>Seu quizz está pronto!</h2>
            <div class="quizz-template">
            <img src="${quizz.image}">
            <span>${quizz.title}</span>
            </div>
            <a onclick=getQuizz(${quizzId}) class="btn-acessar-quizz">Acessar quizz</a>
            <a onclick='redirect("home");' class="btn-voltar-home">Voltar pra home</a>
            `;
            else if(route === "selectedQuizz")
            return `<div class="quizz-container">
          <div class="quizz-header">
            <div></div>
            <h2></h2>
          </div>
          <ul></ul>
        </div>`;
        }

        //Função que direciona o usuário para outra página(view)
        const redirect = (routing) =>
        {
            route = `${routing}`;
            loadPage();
        }

        //Função criada para mostrar que a tela está carregando
        const turnOverlay = (action) =>
        {
          let modal = document.querySelector(".loading-overlay");
          if(action === "add")
          modal.classList.remove("hidden")
          else if(action === "remove")
          modal.classList.add("hidden");
        }

        //FUnção criada para carregar a view e depois adicionar lógica à ela
        const loadPage = () =>
        {
            enableScroll();
            turnOverlay("add");
            document.body.classList.remove("scroll-hidden");

            //Primeiro, carrega a view solicitada
            document.querySelector("main").innerHTML = renderView(route);
            //A seguir, adiciona a lógica pertencente àquela view
            if (route === "home")
            {
              if(quizzesUsuario.length)
                getQuizzesUsuario();
                getQuizzes();
            }
            else if(route === "quizz")
            turnOverlay("remove");
            else if(route === "perguntas")
            {
                for(let i = 1; i <= quantidadePerguntasForm; i++)
                renderPerguntaForm(i); 
                turnOverlay("remove");
            }
            else if(route === "niveis")
            {
                for(let i = 1; i <= quantidadeNiveisForm; i++)
                renderNivelForm(i);
                turnOverlay("remove");
            }
            else if(route === "submit")
            {
              turnOverlay("add");
                axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes', 
                {
                    title: quizz.title,
                    image: quizz.image,
                    questions: quizz.questions,
                    levels: quizz.levels
                }
                )
                .then(response => {
                    quizzId = response.data.id;
                    guardaStorage(response.data.id);
                    redirect("success");
                }).catch(error => {
                    //mostra o objeto quizz no console log para comparação de erro
                    console.log(JSON.stringify(quizz, null, 4));
                    alert("Houve um erro, recomece o processo");
                    resetQuizz();
                    redirect("quizz");
                }).finally(() => turnOverlay("remove"));
            }
            else if(route === "selectedQuizz")
            {
              document.body.classList.add("scroll-hidden");
              disableScroll();
                axios
                .get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${quizzId}`)
                .then((response) => {
                  renderQuizz(response);
                  checkAnswer(response);
                }).finally(() => turnOverlay("remove"));
            }


            let formCollapsibles = document.getElementsByClassName("collapsible");
            if(formCollapsibles)
            {
              formCollapsibles = Array.from(formCollapsibles);
              formCollapsibles.forEach(collapsible => {
                collapsible.addEventListener("click", function() {
                  let contentInside = this.nextElementSibling;
                  if (contentInside.style.maxHeight){
                    contentInside.style.maxHeight = null;
                  } else {
                    contentInside.style.maxHeight = contentInside.scrollHeight + "px";
                  } 
                });
                 });
            }
        }


        //A SEGUIR, VARÍAVEIS E FUNÇÕES DA TELA QUE RESOLVE UM QUIZZ

        let correctAnswers = 0;
        let numberOfQuestions = 0;
        let answered = 0;
        let score = 0;
        let scrollToNext = 0;

        function getQuizzInput()
        {
          let form = document.querySelector(".form-home");
            if (form.checkValidity()) 
            {
              let idQuizz = form.querySelector('.idQUizzInput').value;
              getQuizz(idQuizz);
            }
        }

       //Função que pega todos os dados do quizz 
        function getQuizz(idQuizz) {
            correctAnswers = 0
               numberOfQuestions = 0
               answered = 0;
               score = 0;
               scrollToNext= 0;
            quizzId = idQuizz;
            redirect("selectedQuizz");
        }

        function shuffle(sourceArray) {
          for (var i = 0; i < sourceArray.length - 1; i++) {
            var j = i + Math.floor(Math.random() * (sourceArray.length - i));

            var temp = sourceArray[j];
            sourceArray[j] = sourceArray[i];
            sourceArray[i] = temp;
          }
          return sourceArray;
        }

        //Função que mostra o quizz selecionado na tela
        function renderQuizz(quizz) {
          let title = document.querySelector(".quizz-header h2");
          title.innerHTML = quizz.data.title;

          let titleImg = document.querySelector(".quizz-header");
          titleImg.style.backgroundImage = `url(${quizz.data.image}`;

          let quizzContainer = document.querySelector(".quizz-container ul");

          let questions = quizz.data.questions;
          numberOfQuestions = questions.length;

          for (i = 0; i < questions.length; i++) {
            quizzContainer.innerHTML += `<li class="question-container"></li>`;
          }

          let quizzList = document.querySelectorAll(".quizz-container ul li");

          for (i = 0; i < questions.length; i++) {
            quizzList[i].innerHTML += `
                 <div class="question-header" style="background-color:${questions[i].color}">
                    <h3>${questions[i].title}</h3>
                 </div>
                 <div class="quizz-question""></div>
              `;
          }

          let quizzQuestion = document.querySelectorAll(".quizz-question");

          for (i = 0; i < questions.length; i++) {
            quizzContainer.querySelector("li").scrollIntoView({behavior: "smooth", block:"center", inline:"end"})
            let answers = questions[i].answers;
            shuffle(answers);

            for (j = 0; j < answers.length; j++) {
              quizzQuestion[i].innerHTML += `                     
                 <div class="answer-card" onclick=checkAnswer(this)>
                    <img src="${answers[j].image}" alt="${answers[j].text}">
                    <h3 class="curtain ${answers[j].isCorrectAnswer}">${answers[j].text}</h3>
                 </div>`;
            }
          }
        }

        //Função que verifica a resposta e scrolla a tela para outra pergunta
        function checkAnswer(answerCard) {
          if (answerCard.querySelector("h3").classList.contains("true")) {
            correctAnswers++;
          }

          answerCard.classList.add("selected");
          answered++;

          const children = answerCard.parentElement.children;

          for (i = 0; i < children.length; i++) {
            children[i].querySelector("h3").classList.remove("curtain");

            if (!children[i].classList.contains("selected")) {
              children[i].classList.add("not-selected");
            }
          }
          score = (correctAnswers / numberOfQuestions) * 100;

          if (answered == numberOfQuestions) {
            quizzResults();
          }

          for (
            i = 0;
            i < answerCard.parentNode.parentNode.parentNode.children.length - 1;
            i++
          ) {
            scrollToNext++;
            setTimeout(() => {
              answerCard.parentNode.parentNode.parentNode.children[
                scrollToNext
              ].scrollIntoView({ behavior: "smooth", block: "center" });
            }, 2000);
            return;
          }
        }

        //Função que exibe os resultados de um quizz na tela
        function quizzResults() {
          axios
            .get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${quizzId}`)
            .then((response) => {
              let quizzContainer = document.querySelector(".quizz-container");
              let levels = response.data.levels;
              let text;
              let title;
              let image;
              score = Math.round(score);

              for (i = 0; i < levels.length; i++) {
                if (score >= levels[i].minValue) {
                  text = levels[i].text;
                  title = levels[i].title;
                  image = levels[i].image;
                }
              }
              quizzContainer.innerHTML += `<div class="results-container">
              <div class="results-header">
                 <h3>${score}% de acerto: ${title} </h3>
              </div>
              <div class="results-box">                     
                 <img src=${image} alt=${title}>
                 <h3>${text}</h3>
              </div>
           </div>
                 
           <button class="btn-reiniciar" onclick="getQuizz(${quizzId})">Reiniciar Quizz</button>
           <button class="btn-home" onclick=redirect("home")>Voltar para home</button>
           `;
            }).finally(() => turnOverlay("remove"));
          setTimeout(() => {
            document
              .querySelector(".results-container")
              .scrollIntoView({ behavior: "smooth" });
          }, 2000);
        }


        //Funções referentes ao scroll:
        let keys = {37: 1, 38: 1, 39: 1, 40: 1};

        function preventDefault(e) {
          e.preventDefault();
        }

        function preventDefaultForScrollKeys(e) {
          if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
          }
        }

        // modern Chrome requires { passive: false } when adding event
        var supportsPassive = false;
        try {
          window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function () { supportsPassive = true; } 
          }));
        } catch(e) {}

        var wheelOpt = supportsPassive ? { passive: false } : false;
        var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

        // call this to Disable
        function disableScroll() {
          window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
          window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
          window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
          window.addEventListener('keydown', preventDefaultForScrollKeys, false);
        }

        // call this to Enable
        function enableScroll() {
          window.removeEventListener('DOMMouseScroll', preventDefault, false);
          window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
          window.removeEventListener('touchmove', preventDefault, wheelOpt);
          window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
        }




                loadPage();

                
                 
