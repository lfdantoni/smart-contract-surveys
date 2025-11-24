// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract TokenGatedVoting {
    
    // --- 1. ESTRUCTURAS DE DATOS ---
    
    // Almacenamiento: Guarda el conteo de votos (VoteCount)
    struct Answer {
        uint id;
        string text;
        uint voteCount;
    }

    // Almacenamiento: Guarda las IDs de las respuestas de una pregunta
    struct Question {
        uint id;
        string text;
        uint[] answerIds;
    }

    // 🎯 NUEVA ESTRUCTURA: Para devolver el detalle de la pregunta sin resultados (lectura pública)
    struct AnswerDetails {
        uint id;
        string text;
    }
    
    // 🎯 NUEVA ESTRUCTURA: Para devolver la pregunta y sus respuestas (SIN RESULTADOS)
    struct SurveyQuestion {
        uint questionId;
        string questionText;
        AnswerDetails[] answers; // Usa la estructura "ligera" sin votos
    }

    // Estructura para devolver la pregunta y sus resultados (lectura restringida)
    struct QuestionResult {
        uint questionId;
        string questionText;
        Answer[] answers; // Usa la estructura completa (con votos)
    }


    // --- 2. VARIABLES DE ESTADO ---
    
    string public title;
    mapping(uint => Question) private questions;
    mapping(uint => Answer) private answers;
    uint[] public questionIds; 
    uint private nextQuestionId = 1;
    uint private nextAnswerId = 1;

    address public tokenContractAddress; 
    uint256 public requiredTokenBalance = 1; 
    address public owner; 
    bool public isOpen; 

    // --- 3. MODIFICADORES ---

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el dueno del contrato puede llamar esta funcion.");
        _;
    }

    // --- 4. CONSTRUCTOR (Omitido por brevedad, es el mismo) ---
    
    constructor(
        address _tokenAddress,
        string memory _title,
        string[] memory _questions,
        string[][] memory _answersPerQuestion
    ) {
        owner = msg.sender;
        tokenContractAddress = _tokenAddress;
        isOpen = true; 
        
        require(_questions.length == _answersPerQuestion.length, "Num de preguntas y respuestas debe coincidir.");
        title = _title;
        for (uint i = 0; i < _questions.length; i++) {
            uint currentQuestionId = nextQuestionId++;
            questions[currentQuestionId] = Question(currentQuestionId, _questions[i], new uint[](0));
            questionIds.push(currentQuestionId);
            string[] memory answerTexts = _answersPerQuestion[i];
            for (uint j = 0; j < answerTexts.length; j++) {
                uint currentAnswerId = nextAnswerId++;
                answers[currentAnswerId] = Answer(currentAnswerId, answerTexts[j], 0); 
                questions[currentQuestionId].answerIds.push(currentAnswerId);
            }
        }
    }
    
    // --- 5. FUNCIÓN ADMINISTRATIVA (Cerrar Votación) ---
    
    function closeVoting() public onlyOwner {
        require(isOpen, "La votacion ya estaba cerrada.");
        isOpen = false;
    }
    
    // --- 6. FUNCIÓN DE VOTACIÓN ---

    function vote(uint[] memory _answerIds) public {
        require(isOpen, "La votacion ha sido cerrada y no acepta mas votos.");

        IERC20 token = IERC20(tokenContractAddress);
        require(token.balanceOf(msg.sender) >= requiredTokenBalance, "Requiere token de gobernanza para votar.");
        
        require(_answerIds.length > 0, "Debe seleccionar al menos una respuesta.");
        
        uint[] memory processedQuestionIds = new uint[](_answerIds.length);
        uint processedCount = 0; 

        for (uint i = 0; i < _answerIds.length; i++) {
            uint currentAnswerId = _answerIds[i];
            
            require(answers[currentAnswerId].id != 0, "ID de respuesta invalido en el arreglo.");

            uint questionId = getQuestionIdByAnswerId(currentAnswerId);
            require(questionId != 0, "Error de estructura: La respuesta no esta ligada a una pregunta.");

            for (uint j = 0; j < processedCount; j++) {
                require(processedQuestionIds[j] != questionId, "Ya se ha seleccionado una respuesta para esta pregunta en esta transaccion.");
            }
            
            processedQuestionIds[processedCount] = questionId;
            processedCount++;
            
            answers[currentAnswerId].voteCount++; 
        }
    }
    
    // --- 7. FUNCIONES DE LECTURA MODIFICADAS ---

    /**
     * 🎯 getSurvey (Anteriormente getSurveyResults)
     * @notice Devuelve la estructura de la encuesta (preguntas y respuestas) SIN los votos.
     */
    function getSurvey() public view returns (SurveyQuestion[] memory) {
        SurveyQuestion[] memory results = new SurveyQuestion[](questionIds.length);
        
        for (uint i = 0; i < questionIds.length; i++) {
            uint questionId = questionIds[i];
            Question storage q = questions[questionId];
            
            uint[] storage answerIds = q.answerIds;
            AnswerDetails[] memory answersArray = new AnswerDetails[](answerIds.length);
            
            for (uint j = 0; j < answerIds.length; j++) {
                uint answerId = answerIds[j];
                // Creamos el AnswerDetails (sin voteCount)
                answersArray[j] = AnswerDetails(
                    answers[answerId].id, 
                    answers[answerId].text
                );
            }
            
            results[i] = SurveyQuestion(
                questionId, 
                q.text, 
                answersArray
            );
        }
        
        return results;
    }
    
    /**
     * 🎯 NUEVA getSurveyResults
     * @notice Devuelve el estado completo (preguntas, respuestas y votos). 
     * @dev Solo se puede llamar si la votación ha sido cerrada.
     */
    function getSurveyResults() public view returns (QuestionResult[] memory) {
        // 🚨 RESTRICCIÓN: Solo si está cerrada
        require(!isOpen, "La votacion debe estar cerrada para ver los resultados.");

        QuestionResult[] memory results = new QuestionResult[](questionIds.length);
        
        for (uint i = 0; i < questionIds.length; i++) {
            uint questionId = questionIds[i];
            Question storage q = questions[questionId];
            
            uint[] storage answerIds = q.answerIds;
            Answer[] memory answersArray = new Answer[](answerIds.length);
            
            for (uint j = 0; j < answerIds.length; j++) {
                uint answerId = answerIds[j];
                // Retorna el Answer completo, incluyendo voteCount
                answersArray[j] = answers[answerId];
            }
            results[i] = QuestionResult(
                questionId, 
                q.text, 
                answersArray
            );
        }
        
        return results;
    }
    
    // --- 8. FUNCIONES AUXILIARES (Omitidas por brevedad, son las mismas) ---

    function getQuestionIdByAnswerId(uint _answerId) private view returns (uint) {
        for (uint i = 0; i < questionIds.length; i++) {
            uint qId = questionIds[i];
            Question storage q = questions[qId];
            for (uint j = 0; j < q.answerIds.length; j++) {
                if (q.answerIds[j] == _answerId) {
                    return qId;
                }
            }
        }
        return 0;
    }

    function setTokenAddress(address _newTokenAddress) public onlyOwner {
        require(_newTokenAddress != address(0), "La nueva direccion no puede ser cero.");
        tokenContractAddress = _newTokenAddress;
    }
}