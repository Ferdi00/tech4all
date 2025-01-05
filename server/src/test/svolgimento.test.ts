import { QuizService } from "../app/services/QuizService";
import { QuizDao } from "../app/dao/QuizDao";
import { DomandaDao } from "../app/dao/DomandaDao";
import { RispostaDao } from "../app/dao/RispostaDao";
import { SvolgimentoDao } from "../app/dao/SvolgimentoDao";
import { UtenteDao } from "../app/dao/UtenteDao";
import { Quiz } from "../app/entity/gestione_quiz/Quiz";
import { Domanda } from "../app/entity/gestione_quiz/Domanda";
import { Risposta } from "../app/entity/gestione_quiz/Risposta";
import { Utente } from "../app/entity/gestione_autenticazione/Utente";
import { Svolgimento } from "../app/entity/gestione_quiz/Svolgimento";

jest.mock("../app/dao/QuizDao");
jest.mock("../app/dao/DomandaDao");
jest.mock("../app/dao/RispostaDao");
jest.mock("../app/dao/SvolgimentoDao");
jest.mock("../app/dao/UtenteDao");

describe("QuizService - getQuizByTutorialId", () => {
  let quizService: QuizService;
  let quizDaoMock: jest.Mocked<QuizDao>;
  let domandaDaoMock: jest.Mocked<DomandaDao>;
  let rispostaDaoMock: jest.Mocked<RispostaDao>;

  beforeEach(() => {
    quizDaoMock = new QuizDao() as jest.Mocked<QuizDao>;
    domandaDaoMock = new DomandaDao() as jest.Mocked<DomandaDao>;
    rispostaDaoMock = new RispostaDao() as jest.Mocked<RispostaDao>;
    quizService = new QuizService();

    // Override delle dipendenze private per il test
    // @ts-ignore
    quizService["quizDao"] = quizDaoMock;
    // @ts-ignore
    quizService["domandaDao"] = domandaDaoMock;
    // @ts-ignore
    quizService["rispostaDao"] = rispostaDaoMock;
  });

  it("should return the quiz with its questions and answers for a given tutorialId", async () => {
    // Arrange
    const tutorialId = 1;

    const risposteArray = [
      new Risposta("Roma", true, 1, 1),
      new Risposta("Milano", false, 2, 1),
      new Risposta("Napoli", false, 3, 1),
    ];

    const domande = [
      new Domanda("Qual è la capitale d'Italia?", risposteArray, 1, tutorialId),
    ];

    const quiz = new Quiz(1, domande);

    quizDaoMock.getQuizByTutorialId.mockResolvedValue(quiz);

    // Act
    const result = await quizService.getQuizByTutorialId(tutorialId);

    // Assert
    expect(quizDaoMock.getQuizByTutorialId).toHaveBeenCalledWith(tutorialId);
    expect(result).toEqual(quiz);
  });

  it("should throw an error if no quiz is found for the given tutorialId", async () => {
    // Arrange
    const tutorialId = 999; // Un ID che non corrisponde a nessun quiz
    quizDaoMock.getQuizByTutorialId.mockResolvedValue(null); // Mock per restituire null

    // Act & Assert
    await expect(
      quizService.getQuizByTutorialId(tutorialId)
    ).rejects.toThrowError(new Error("Impossibile recuperare il quiz")); // Verifica che venga lanciato l'errore con il messaggio corretto
  });
});

describe("QuizService - eliminaQuiz", () => {
  let quizService: QuizService;
  let quizDaoMock: jest.Mocked<QuizDao>;
  let domandaDaoMock: jest.Mocked<DomandaDao>;
  let rispostaDaoMock: jest.Mocked<RispostaDao>;

  beforeEach(() => {
    quizDaoMock = new QuizDao() as jest.Mocked<QuizDao>;
    domandaDaoMock = new DomandaDao() as jest.Mocked<DomandaDao>;
    rispostaDaoMock = new RispostaDao() as jest.Mocked<RispostaDao>;
    quizService = new QuizService();

    // Override delle dipendenze private per il test
    // @ts-ignore
    quizService["quizDao"] = quizDaoMock;
    // @ts-ignore
    quizService["domandaDao"] = domandaDaoMock;
    // @ts-ignore
    quizService["rispostaDao"] = rispostaDaoMock;
  });

  it("should return an error if the quiz is not found", async () => {
    const quizId = 999;
    quizDaoMock.getQuizById.mockResolvedValue(null);

    const result = await quizService.eliminaQuiz(quizId);

    expect(quizDaoMock.getQuizById).toHaveBeenCalledWith(quizId);
    expect(result).toEqual({
      success: false,
      message: "Quiz non trovato.",
    });
  });
});

describe("QuizService - eseguiQuiz", () => {
  let quizService: QuizService;
  let quizDaoMock: jest.Mocked<QuizDao>;
  let domandaDaoMock: jest.Mocked<DomandaDao>;
  let rispostaDaoMock: jest.Mocked<RispostaDao>;
  let svolgimentoDaoMock: jest.Mocked<SvolgimentoDao>;
  let utenteDaoMock: jest.Mocked<UtenteDao>;

  beforeEach(() => {
    quizDaoMock = new QuizDao() as jest.Mocked<QuizDao>;
    domandaDaoMock = new DomandaDao() as jest.Mocked<DomandaDao>;
    rispostaDaoMock = new RispostaDao() as jest.Mocked<RispostaDao>;
    utenteDaoMock = new UtenteDao() as jest.Mocked<UtenteDao>;
    svolgimentoDaoMock = new SvolgimentoDao(
      quizDaoMock,
      utenteDaoMock
    ) as jest.Mocked<SvolgimentoDao>;
    quizService = new QuizService();

    // Override delle dipendenze private per il test
    // @ts-ignore
    quizService["quizDao"] = quizDaoMock;
    // @ts-ignore
    quizService["domandaDao"] = domandaDaoMock;
    // @ts-ignore
    quizService["rispostaDao"] = rispostaDaoMock;
    // @ts-ignore
    quizService["svolgimentoDao"] = svolgimentoDaoMock;
    // @ts-ignore
    quizService["utenteDao"] = utenteDaoMock;
  });

  it("should correctly execute a quiz", async () => {
    // Arrange
    const quizId = 1;
    const utenteId = 1;
    const risposteUtente = [1, 2, 3];

    const risposteArray = [
      new Risposta("Roma", true, 1, 1),
      new Risposta("Milano", false, 2, 1),
      new Risposta("Napoli", false, 3, 1),
    ];

    const domande = [
      new Domanda("Qual è la capitale d'Italia?", risposteArray, 1, 1),
    ];

    const quiz = new Quiz(1, domande);
    const utente = new Utente(
      1,
      "test@example.com",
      "Password1!",
      "Nome",
      "Cognome",
      false,
      0
    );

    quizDaoMock.getQuizById.mockResolvedValue(quiz);
    utenteDaoMock.getUtenteById.mockResolvedValue(utente);
    svolgimentoDaoMock.createSvolgimento.mockResolvedValue();

    // Act
    const result = await quizService.eseguiQuiz(
      quizId,
      utenteId,
      risposteUtente
    );

    // Assert
    expect(quizDaoMock.getQuizById).toHaveBeenCalledWith(quizId);
    expect(utenteDaoMock.getUtenteById).toHaveBeenCalledWith(utenteId);
    expect(svolgimentoDaoMock.createSvolgimento).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: "Quiz eseguito con successo.",
      esito: true,
    });
  });
});

describe("QuizService - getQuizByTutorialId (quando il tutorialId non esiste)", () => {
  let quizService: QuizService;
  let quizDaoMock: jest.Mocked<QuizDao>;

  beforeEach(() => {
    quizDaoMock = new QuizDao() as jest.Mocked<QuizDao>;
    quizService = new QuizService();

    // Override delle dipendenze private per il test
    // @ts-ignore
    quizService["quizDao"] = quizDaoMock;
  });

  it("should throw an error if the tutorialId does not exist", async () => {
    // Arrange
    const tutorialId = 999; // Un tutorialId che non esiste

    // Simuliamo che il quiz non venga trovato per il tutorialId non esistente
    quizDaoMock.getQuizByTutorialId.mockResolvedValue(null); // Simuliamo che non venga trovato nessun quiz

    // Act & Assert
    await expect(
      quizService.getQuizByTutorialId(tutorialId)
    ).rejects.toThrowError(new Error("Impossibile recuperare il quiz")); // Controlliamo che venga lanciato un errore con il messaggio appropriato
  });
});

describe("QuizService - eseguiQuiz", () => {
  let quizService: QuizService;
  let quizDaoMock: jest.Mocked<QuizDao>;
  let domandaDaoMock: jest.Mocked<DomandaDao>;
  let rispostaDaoMock: jest.Mocked<RispostaDao>;
  let svolgimentoDaoMock: jest.Mocked<SvolgimentoDao>;
  let utenteDaoMock: jest.Mocked<UtenteDao>;

  beforeEach(() => {
    quizDaoMock = new QuizDao() as jest.Mocked<QuizDao>;
    domandaDaoMock = new DomandaDao() as jest.Mocked<DomandaDao>;
    rispostaDaoMock = new RispostaDao() as jest.Mocked<RispostaDao>;
    utenteDaoMock = new UtenteDao() as jest.Mocked<UtenteDao>;
    svolgimentoDaoMock = new SvolgimentoDao(
      quizDaoMock,
      utenteDaoMock
    ) as jest.Mocked<SvolgimentoDao>;
    quizService = new QuizService();

    // Override delle dipendenze private per il test
    // @ts-ignore
    quizService["quizDao"] = quizDaoMock;
    // @ts-ignore
    quizService["domandaDao"] = domandaDaoMock;
    // @ts-ignore
    quizService["rispostaDao"] = rispostaDaoMock;
    // @ts-ignore
    quizService["svolgimentoDao"] = svolgimentoDaoMock;
    // @ts-ignore
    quizService["utenteDao"] = utenteDaoMock;
  });

  it("should update the user's quizSuperati count if the quiz is passed", async () => {
    // Arrange
    const quizId = 1;
    const utenteId = 1;
    const risposteUtente = [1, 2, 3];

    const risposteArray = [
      new Risposta("Roma", true, 1, 1),
      new Risposta("Milano", false, 2, 1),
      new Risposta("Napoli", false, 3, 1),
    ];

    const domande = [
      new Domanda("Qual è la capitale d'Italia?", risposteArray, 1, 1),
    ];

    const quiz = new Quiz(1, domande);
    const utente = new Utente(
      1,
      "test@example.com",
      "Password1!",
      "Nome",
      "Cognome",
      false,
      0
    );

    quizDaoMock.getQuizById.mockResolvedValue(quiz);
    utenteDaoMock.getUtenteById.mockResolvedValue(utente);
    svolgimentoDaoMock.getSvolgimento.mockResolvedValue(null);
    svolgimentoDaoMock.createSvolgimento.mockResolvedValue();

    // Act
    const result = await quizService.eseguiQuiz(
      quizId,
      utenteId,
      risposteUtente
    );

    // Assert
    expect(utenteDaoMock.updateQuizSuperati).toHaveBeenCalledWith(utente);
    expect(result).toEqual({
      success: true,
      message: "Quiz eseguito con successo.",
      esito: true,
    });
  });
});

describe("QuizService - eliminaQuiz", () => {
  let quizService: QuizService;
  let quizDaoMock: jest.Mocked<QuizDao>;
  let domandaDaoMock: jest.Mocked<DomandaDao>;
  let rispostaDaoMock: jest.Mocked<RispostaDao>;

  beforeEach(() => {
    quizDaoMock = new QuizDao() as jest.Mocked<QuizDao>;
    domandaDaoMock = new DomandaDao() as jest.Mocked<DomandaDao>;
    rispostaDaoMock = new RispostaDao() as jest.Mocked<RispostaDao>;
    quizService = new QuizService();

    // Override delle dipendenze private per il test
    // @ts-ignore
    quizService["quizDao"] = quizDaoMock;
    // @ts-ignore
    quizService["domandaDao"] = domandaDaoMock;
    // @ts-ignore
    quizService["rispostaDao"] = rispostaDaoMock;
  });

  it("should delete all related questions and answers when deleting the quiz", async () => {
    const quizId = 1;
    const domanda = new Domanda(
      "Domanda di esempio",
      [new Risposta("Risposta", true, 1, quizId)],
      1,
      quizId
    );
    const quiz = new Quiz(quizId, [domanda]);

    quizDaoMock.getQuizById.mockResolvedValue(quiz);
    domandaDaoMock.getAllDomande.mockResolvedValue([domanda]);
    rispostaDaoMock.deleteRisposta.mockResolvedValue(undefined);
    domandaDaoMock.deleteDomanda.mockResolvedValue(undefined);
    quizDaoMock.deleteQuiz.mockResolvedValue(undefined);

    const result = await quizService.eliminaQuiz(quizId);

    // Verifica che le risposte siano eliminate
    expect(rispostaDaoMock.deleteRisposta).toHaveBeenCalled();
    // Verifica che le domande siano eliminate
    expect(domandaDaoMock.deleteDomanda).toHaveBeenCalled();
    // Verifica che il quiz sia stato eliminato
    expect(quizDaoMock.deleteQuiz).toHaveBeenCalledWith(quizId);

    expect(result).toEqual({
      success: true,
      message: "Quiz e relative domande e risposte eliminati con successo.",
    });
  });

  it("should return error if quiz not found", async () => {
    const quizId = 999;

    quizDaoMock.getQuizById.mockResolvedValue(null); // Quiz non trovato

    const result = await quizService.eliminaQuiz(quizId);

    expect(result).toEqual({
      success: false,
      message: "Quiz non trovato.",
    });
  });

  it("should handle errors gracefully", async () => {
    const quizId = 1;
    const errorMessage = "Database error";

    // Mock di errore per quizDao
    quizDaoMock.getQuizById.mockRejectedValue(new Error(errorMessage));

    const result = await quizService.eliminaQuiz(quizId);

    expect(result).toEqual({
      success: false,
      message: "Errore interno del server. Riprova più tardi.",
    });
  });
});
