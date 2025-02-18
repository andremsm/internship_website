import axios from "axios";
import { browserName } from "react-device-detect";

export function isLongString(s: string, font: string, origin: number) {
	// Align the box's text horizontally. Without this the boxes have an
	// irregular size, depending on the length of the course's title
	// Longer titles still "break" the sizing, but this should be enough
	// for all courses up to 06/10/2022
	// Origin  = 0: title
	// Origin != 0: anything else
	const canvas = document.createElement("canvas");
	let context: CanvasRenderingContext2D;
	context = canvas.getContext("2d")!;
	//								^^^
	// The above exclamation mark's purpose is to prevent typescript from
	// throwing an error due to getContext possibly returning null

	context.font = font || getComputedStyle(document.body).font;

	if (context.measureText(s).width < 200) {
		if (origin === 0) {
			return "ctext ";
		} else {
			return "ctext3 ";
		}
	} else {
		if (origin === 0) {
			return "ctext2 ";
		} else {
			return "ctext3 ";
		}
	}
}

/*
export function isLongModalTitle(s: string) {
	//Função rápida para verificar se é preciso mudar o título para caber
	//no box e no modal. Se o tamanho da string é maior que 138 (não em
	//caracteres, em pixels) em um celular, o texto começa a sair pra fora
	//do modal e o "x" de fechar desaparece. Mesma coisa para PC, mas com
	//tamanho 234 nesse caso.
	const canvas = document.createElement("canvas");
	let context: CanvasRenderingContext2D;
	context = canvas.getContext("2d")!;
	//								^^^
	//O ponto de exclamação acima serve pra não dar erro de possivelmente null

	context.font = "Nunito" || getComputedStyle(document.body).font;

	if (context.measureText(s).width > 138 && !isNotMobile()) {
		return true;
	}

	if (context.measureText(s).width > 234) {
		return true;
	}
	return false;
}
*/

export function deconstructString(
	s: string,
	context: CanvasRenderingContext2D,
	width: number
) {
	/***********
	 * OBSOLETE *
	 ***********/

	//Após um tempo eu descobri que isso tudo era desnecessário e só
	//precisava resetar o flex-shrink.

	//Recebe o índice do último caractere espaço " " na string.
	let lastIndex = 999999;
	//Gambiarra para o caso em que o título do curso é uma palavra muito
	//grande seguida de palavras normais.
	//Testado com: "Pneumoultramicroscoopicosilicovulcanoconiose Curso
	//de Metodologia de Produção de Conhecimento".
	//Também funciona caso o título seja apenas uma palavra muito grande,
	//embora nesse caso a gambiarra não era necessária anteriormente.
	//Testado com: "Pneumoultramicroscoopicosilicovulcanoconiose".
	let iterationIndex = 0;
	//Começa com string original. Recebe a string após uma iteração
	//de desconstrução.
	let string = s;
	//Começa com string original. Recebe a string antes de uma iteração
	//de desconstrução.
	let previousString = s;
	//Recebe a string após uma iteração de desconstrução.
	let remainingText = "";
	//Armazena a string após a desconstrução anterior. Necessário para
	//o flag break.
	let previousRemainingText = "";
	//Armazenar a string original em um array de strings menores.
	let deconstructedString: Array<string> = [];
	//Gambiarra para o caso em que só resta uma palavra na string,
	//para lembrar se o array deve receber string OU previousString
	//e remainingText OU previousRemainingText.
	let flag = false;

	//Enquanto a string que está sendo desconstruída for maior que
	//o tamanho máximo que a string pode assumir sem quebrar a formatação
	//(width), iterar desconstruindo a string em substrings menores.
	while (context.measureText(string).width > width) {
		//Enquanto a substring for menor que o tamanho máximo que a string
		//pode assumir sem quebrar a formatação (width).
		while (context.measureText(remainingText).width < width) {
			//Armazenar resultados da iteração anterior.
			previousRemainingText = remainingText;
			previousString = string;
			//Armazenar o último índice onde " " aparece na string.
			//Caso não exista essa função retorna -1, o que é um valor
			//válido para o slice, e nesse caso corta o último caractere.
			lastIndex = string.lastIndexOf(" ");
			//Se for a primeira vez que um valor -1 aparece, significa
			//que é a última palavra maior que width na string, então
			//é preciso quebrar a string antes de quebrar a palavra
			//(evita formatações estranhas fora do modal, especificamente
			//no box. Também melhora um pouco a formatação no modal).
			if (lastIndex === -1 && iterationIndex === 0) {
				iterationIndex++;
				flag = true;
				break;
			}
			//Separar a string em duas partes, a parte antes de " " e a
			//parte depois de " ".
			remainingText = string.slice(lastIndex) + remainingText;
			string = string.slice(0, lastIndex);

			if (lastIndex === -1) flag = true;

			//Parar de quebrar a string se esta já está menor que width.
			if (context.measureText(string).width < width) {
				flag = true;
				break;
			}
		}
		//Se flag == true, (não lembro kek)
		if (flag) deconstructedString.push(remainingText);
		else deconstructedString.push(previousRemainingText);
		remainingText = "";
		previousRemainingText = "";
	}
	if (flag) deconstructedString.push(string);
	else deconstructedString.push(previousString);
	//String vai estar desconstruída ao contrário, pois busca pelo último
	//índice, então é preciso invertê-la.
	deconstructedString = deconstructedString.reverse();

	return deconstructedString;
}

export function changeTitle(s: string) {
	/***********
	 * OBSOLETE *
	 ***********/

	//Após um tempo eu descobri que isso tudo era desnecessário e só
	//precisava resetar o flex-shrink.

	//Chama deconstructString com o width certo para um celular, ou um PC.
	//Após isso, reconstrói a string tirando espaços e inserindos \n onde
	//necessário.
	const canvas = document.createElement("canvas");
	let context: CanvasRenderingContext2D;
	context = canvas.getContext("2d")!;
	//								^^^
	//O ponto de exclamação acima serve pra não dar erro de possivelmente null

	context.font = "Nunito" || getComputedStyle(document.body).font;

	let deconstructedString: Array<string>;

	//Tamanho da string, em pixels.
	let width = 0;

	if (isNotMobile()) {
		//Valor que pareceu ser ideal em um monitor 1920x1080.
		width = 234;
	} else {
		//Valor que pareceu ser ideal para telas de celulares grandes.
		width = 130;
	}
	deconstructedString = deconstructString(s, context, width);
	/*for (let i = 0; i < deconstructedString.length; i++) {
		console.log(
			context.measureText(deconstructedString[i]).width +
				deconstructedString[i]
		);
	}*/
	//Trim para remover alguns espaços vestigiais.
	let returnString = deconstructedString[0].trim();
	for (let i = 1; i < deconstructedString.length; i++) {
		returnString = returnString + "\n" + deconstructedString[i].trim();
	}

	return returnString;

	/***OLD***/
	/*

	let lastIndex = 999999;
	let string = s;

	if (isNotMobile()) {
		while (context.measureText(string).width > 234) {
			lastIndex = string.lastIndexOf(" ");
			string = string.slice(0, lastIndex);
		}
	} else {
		while (context.measureText(string).width > 138) {
			lastIndex = string.lastIndexOf(" ");
			string = string.slice(0, lastIndex);
		}
	}
	const remainingText = s.slice(lastIndex + 1);

	return string + "\n" + remainingText;

	*/
	/***OLD***/
}

export function isNotMobile() {
	// Determines if the current device is a phone, based on screen width
	if (window.screen.width < 500) {
		return false;
	} else return true;
}

export function sizeBoxesMobile() {
	// Makes boxes a bit smaller on pc
	if (isNotMobile()) return " mx-6 px-6 ";
	else return " ";
}

export function importAll(r: __WebpackModuleApi.RequireContext) {
	// When you import all images, they come sorted lexicographically
	// (for example: [0, 0, 0, 1, 1, 1, 10, 10, 10, 11, 11, 11, 12, 12...]),
	// instead of being sorted based on the number at the beginning of the
	// folder's title. This sorts them correctly
	const keys = r.keys();
	keys.sort(function compareFn(a: string, b: string) {
		//const a_int = +a.slice(2, a.indexOf(" "));
		//const b_int = +b.slice(2, b.indexOf(" "));
		// + -> string to int
		const a_int = +a.split(" - ")[0];
		const b_int = +b.split(" - ")[0];
		if (a_int < b_int) {
			return -1;
		}
		if (a_int > b_int) {
			return 1;
		}
		// a must be equal to b
		return 0;
	});

	return keys.map(r);
}

export function widthIfMobile() {
	if (window.screen.width > 667) return 600;
	else return window.screen.width - 80;
}

export function heightIfMobile() {
	if (window.screen.width > 667) return 400;
	//(original height / original width) x new width = new height
	else return (400 / 600) * (window.screen.width - 80);
}

export function isLongModalButton(s: string) {
	const canvas = document.createElement("canvas");
	let context: CanvasRenderingContext2D;
	context = canvas.getContext("2d")!;
	//								^^^
	// The above exclamation mark's purpose is to prevent typescript from
	// throwing an error due to getContext possibly returning null

	context.font = "Nunito" || getComputedStyle(document.body).font;

	if (context.measureText(s).width > 250 && !isNotMobile()) {
		return true;
	}

	if (context.measureText(s).width > 300) {
		return true;
	}
	return false;
}

export const browser = () => {
	//console.log(browserName);
	if (browserName === "Chrome") return " headNoBorder ";
	else return null;
};

export function textoNoticia() {
	const s = "Clique aqui para ver a notícia do MPPR relacionada a este curso";
	if (isLongModalButton(s))
		return "Clique aqui para ver a notícia do MPPR relacionada a este curso";
	return s;
}

const API_URL = "http://localhost:8080/api/auth/";

export function login(username: string, password: string) {
	return axios
		.post(API_URL + "signin", {
			username,
			password,
		})
		.then((response) => {
			if (response.data.accessToken) {
				localStorage.setItem("user", JSON.stringify(response.data));
			}

			return response.data;
		});
}

export function logout() {
	localStorage.removeItem("user");
	window.location.reload();
}

export function getCurrentUser() {
	const userStr = localStorage.getItem("user");
	if (userStr) return userStr;

	return undefined;
}

export function authExpiration() {
	const parseJwt = (token: string) => {
		try {
			return JSON.parse(window.atob(token.split(".")[1]));
		} catch (e) {
			console.log("error?");
			return null;
		}
	};
	const user = getCurrentUser();
	//console.log(user);
	if (user) {
		const decodedJwt = parseJwt(user);
		//console.log(decodedJwt.exp * 1000 - Date.now());
		if (decodedJwt.exp * 1000 < Date.now()) {
			localStorage.removeItem("user");
			return undefined;
		} else return user;
	} else return undefined;
}
