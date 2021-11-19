       //Aqui ficam as variáveis globais que serão usadas nas funções
       let route = "home";
       let numberOfQuestions = null;
       let numberOfLevels = null;
       let idQuizz = null;

       let quizz = {
        title: null,
        image: null,
        questions: [],
        levels: []
       };

       //Definição do component quizz(visual)
       const Quizz = (title, image, id) =>
       {
           return `<a href="${id}">
                       <li class="quizz">
                           <img src="${image}">
                           <span>${title}</span>
                       </li>
                   </a>`;
       }

       //Função que lista todos os quizz e cria uma lista de componentes
        const getQuizzes = () =>
       {   
           axios.get("https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes")
           .then(response  => 
           {
               const quizzes = response.data;
               console.log(quizzes);
               const listaQuizzes = quizzes.map((quizz) => 
               {
                  return Quizz(quizz.title, quizz.image, quizz.id); 
               })
               .join("");
               document.querySelector(".lista-quizz-todos ul").innerHTML = listaQuizzes;
           });
       }

       //Função que renderiza um formulário de pergunta
       const addPerguntaForm = (number) =>
        {
            let form =  `<form class="form-perguntas">
            <h3>Pergunta ${number}</h3>
            <input type="text" minlength="20" placeholder="     Texto da pergunta" name="pergunta-texto" onchange="return;" required />
            <input type="text" placeholder="     A Cor de fundo da pergunta" name="pergunta-cor" pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" required />
            <h3>Resposta correta</h3>
            <input type="text" placeholder="     Resposta correta " name="resposta-correta" required/>
            <input type="url" placeholder="     URL da imagem" name="url-imagem-correta" required/>
            <h3>Respostas incorretas</h3>
            <div class="group">
            <input type="text" placeholder="     Resposta incorreta 1" name="resposta-incorreta-1" required />
            <input type="url" placeholder="     URL da imagem 1" name="url-imagem-incorreta-1" required/>
            </div>
            <div class="group">
            <input type="text" placeholder="     Resposta incorreta 2" name="resposta-incorreta-2" required/>
            <input type="url" placeholder="     URL da imagem 2" name="url-imagem-incorreta-2" required/>
            </div>
            <div class="group">
            <input type="text" placeholder="     Resposta incorreta 3" name="resposta-incorreta-3" required/>
            <input type="url" placeholder="     URL da imagem 3" name="url-imagem-incorreta-3" required/>
            </div>
            </form>`;
                let container =  document.querySelector(".container-perguntas");
                container.insertAdjacentHTML("beforeend", form);
        }

        //Função que renderiza um formulário de nível
        const addNivelForm = (number) =>
        {
            let form =  `<form class="form-niveis">
            <h3>Nivel ${number}</h3>
            <input type="text" minlength="10" placeholder="     Título do nível" name="titulo-nivel" required />
            <input type="number" placeholder="     % de acerto mínima" min="0" max="100" name="acerto-nivel" required />
            <input type="url" placeholder="     URL da imagem do seu quizz" name="url-imagem-nivel" required />
            <input type="text" minlength="30" placeholder="     Descrição do nível" name="descricao-nivel" required />
            </div>
            </form>`;
                let container =  document.querySelector(".container-niveis");
                container.insertAdjacentHTML("beforeend", form);
        }

        const resetQuizz = () =>
        {
            let numberOfQuestions = 0;
            let numberOfLevels = 0;
            let idQuizz = null;
            let quizz = {
            title: null,
            image: null,
            questions: [],
            levels: []
            };
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
                    quizz.title = forms[0].querySelector('input[name="quiz-title"]').value;
                    quizz.image = forms[0].querySelector('input[name="url-image-quizz"]').value;
                    numberOfQuestions = forms[0].querySelector('input[name="number-asks-quizz"]').value;
                    numberOfLevels = forms[0].querySelector('input[name="number-levels-quizz"]').value;
                    route = "perguntas";
                    loadPage();
                }
                else if(route === "perguntas")
                {
                    forms.forEach(f => {
                        let question = {
                            title: f.querySelector('input[name="pergunta-texto"]').value,
                            color: f.querySelector('input[name="pergunta-cor"]').value,
                            answers: null
                        };
                        let answers = [];
                        answers.push(
                            {
                                text: f.querySelector('input[name="resposta-correta"]').value,
                                image: f.querySelector('input[name="url-imagem-correta"]').value,
                                isCorrectAnswer: true
                            });
                            
                            let respostasIncorretas = f.querySelectorAll(".group");
                            respostasIncorretas = Array.from(respostasIncorretas);
                            respostasIncorretas.forEach(resposta => 
                            {
                                    answers.push(
                                        {
                                            text: resposta.querySelector('input[type="text"]').value,
                                            image: resposta.querySelector('input[type="url"]').value,
                                            isCorrectAnswer: false
                                        });
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
                            title: f.querySelector('input[name="titulo-nivel"]').value,
                            image: f.querySelector('input[name="url-imagem-nivel"]').value,
                            text: f.querySelector('input[name="descricao-nivel"]').value,
                            minValue: f.querySelector('input[name="acerto-nivel"]').value
                        };
                        quizz.levels.push(level);
                    });
                     redirect("submit"); 
                 }
            }
            else
            alert("Por favor preencha os dados corretamente");
        }

        const renderView = (route) => 
        {
            if(route === "home")
            return `
            <div class="lista-quizz-usuario">
                <span>Você não criou nenhum quizz ainda :(</span>
                <a onclick='redirect("quizz");'>Criar Quizz</a>
            </div>
            <div class="lista-quizz-todos">
                <h2>Todos os quizzes</h2>
                <ul></ul>
            </div>
            `;
            else if(route === "quizz")
            return `
            <h2>Comece pelo começo</h2>
            <form class="form-perguntas">
                <h3>Pergunta</h3>
                <input type="text" minlength="20" maxlength="65" placeholder="     Título do quizz" name="quizz-title" required />
                <input type="url" placeholder="     URL da imagem do seu quizz" name="url-image-quizz" required />
                <input type="number" placeholder="     Quantidade de perguntas do quizz" min="3" name="number-asks-quizz" required />
                <input type="number" placeholder="     Quantidade de níveis do quizz" min="2" name="number-levels-quizz" required />
            </form>
            <a class="submit" onclick="submit()">Prosseguir pra criar perguntas</a>
            `;
            else if(route === "perguntas")
            return `
            <h2>Crie suas perguntas</h2>
            <div class="container-perguntas">
            </div>
            <a class="add-pergunta" href="#" onclick="addPerguntaForm()" ><span>Pergunta</span></a>
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
            <div class="quizz-container">
            <img src="${quizz.image}">
            <span>${quizz.title}</span>
            </div>
            <a class="btn-acessar-quizz">Acessar quizz</a>
            <a onclick='redirect("home");' class="btn-voltar-home">Voltar pra home</a>
            `;
        }

        const redirect = (routing) =>
        {
            route = `${routing}`;
            loadPage();
        }

        const loadPage = () =>
        {
            document.querySelector("main").innerHTML = renderView(route);
            if (route === "home")
            {
                getQuizzes();
            }
            else if(route === "perguntas")
            {
                for(let i = 0; i < numberOfQuestions; i++)
                addPerguntaForm(i); 
            }
            else if(route === "niveis")
            {
                for(let i = 0; i < numberOfLevels; i++)
                addNivelForm(i);
            }
            else if(route === "submit")
            {
                axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes', 
                        {
                            title: quizz.title,
                            image: quizz.image,
                            questions: quizz.questions,
                            levels: quizz.levels
                        }
                        )
                        .then(response => {
                            idQuizz = response.data.id;
                            redirect("success");
                        }).catch(error => {
                            console.log(JSON.stringify(quizz, null, 4));
                            alert("Houve um erro, recomece o processo");
                            resetQuizz();
                            redirect("quizz");
                        });
            }
            else if(route === "success")
            {
                axios.get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${idQuizz}`)
                .then(response => {
                    quizz = response.data;
                    document.querySelector(".main").innerHTML = renderView(route);
                }).catch(error => {
                });
            }
        }

        loadPage();

      

        
         
