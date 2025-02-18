import { keyboardKey } from "@testing-library/user-event";
import { useState, useEffect, useRef } from "react";
//import { useNavigate } from "react-router-dom";
import { TweenMax, Power4, /*Expo, Bounce,*/ Elastic /*, Back*/ } from "gsap";
import { isNotMobile, browser } from "./Utils";
import "./LoginModal.css";
import "./glyphs/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";

export function UpdatePasswordModal() {
	//Para mais informações, ver como o as classes funcionam no site do Bulma,
	//principalmente a classe "Modal".

	const [isModal, setModal] = useState(false);
	const [isLoading, setLoading] = useState("");
	const [isDangerLogin, setDangerLogin] = useState("");
	const [isDangerPw, setDangerPw] = useState("");
	const [isDangerNewPW, setDangerNewPW] = useState("");
	const [isDangerConfirmPW, setDangerConfirmPW] = useState("");
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isWrongLoginOrPw, setIsWrongLoP] = useState(false);
	const [isWrongConfirmPW, setIsWrongConfirmPW] = useState(false);

	//Ao clicar no box, definir o modal como ativo.
	const handleModalOpen = () => {
		if (!isNotMobile())
			window.history.pushState(
				"fake-route",
				document.title,
				window.location.href
			);
		setModal(true);
	};

	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	const handleModalClose = () => {
		if (!isNotMobile()) window.history.back();
		setModal(false);
	};

	const handlePasswordUpdate = () => {
		setLoading(" is-loading");
		fetch("http://localhost:8080/api/auth/changepassword", {
			method: "POST",
			body: JSON.stringify({
				username: login,
				password: password,
				new_password: newPassword,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((response) => {
				if (response.ok) return response.json();
				else throw new Error("Status code error");
			})
			.then((json) => {
				localStorage.setItem("user", json.accessToken);
				window.location.reload();
			})
			.catch((err) => {
				setDangerLogin(" is-danger");
				setDangerPw(" is-danger");
				setIsWrongLoP(true);
				setLoading("");
			});
	};

	const checkNewPassword = () => {
		if (newPassword !== confirmPassword) {
			setDangerNewPW(" is-danger");
			setDangerConfirmPW(" is-danger");
			setIsWrongConfirmPW(true);
			setLoading("");
			return;
		}
		handlePasswordUpdate();
	};

	const active = isModal ? "is-active" : "";

	const handleEnter = (event: keyboardKey) => {
		if (event.key === "Enter") {
			const currentElement = document.activeElement;
			const loginElement = document.getElementById("login");
			const passwordElement = document.getElementById("password");
			const newPasswordElement = document.getElementById("new_password");
			const confirmPasswordElement =
				document.getElementById("confirm_password");
			if (
				currentElement === loginElement ||
				currentElement === passwordElement ||
				currentElement === newPasswordElement ||
				currentElement === confirmPasswordElement
			)
				checkNewPassword();
		}
	};

	function closeModal() {
		setModal(false);
	}

	//Permite fechar o modal pressionando "Voltar" no navegador.
	useEffect(() => {
		//Mobile only.
		if (!isNotMobile()) {
			// Add a fake history event so that the back button does nothing if pressed once

			window.addEventListener("popstate", closeModal);

			// Here is the cleanup when this component unmounts
			return () => {
				window.removeEventListener("popstate", closeModal);
				// If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
				if (window.history.state === "fake-route") {
					window.history.back();
				}
			};
		} else return () => {};
	}, []);

	const modalRef = useRef<HTMLDivElement>(null);

	const wrongLoginPw = isWrongLoginOrPw ? (
		<div>
			<div
				style={{ cursor: "default" }}
				className="has-text-centered has-text-danger is-size-5"
			>
				Usuário ou senha incorreto.
			</div>
		</div>
	) : (
		<div className="hidden is-size-5">&nbsp;</div>
	);

	const wrongConfirmPW = isWrongConfirmPW ? (
		<div>
			<div
				style={{ cursor: "default" }}
				className="has-text-centered has-text-danger is-size-5"
			>
				Nova senha difere da confirmação.
			</div>
		</div>
	) : (
		<div className="hidden is-size-5">&nbsp;</div>
	);

	useEffect(() => {
		if (isWrongLoginOrPw) {
			const element = document.querySelector(
				".has-text-centered.has-text-danger"
			);
			TweenMax.set(element, { y: 50 });
			TweenMax.fromTo(
				element,
				1,
				{ y: 50 },
				{ y: 0, opacity: 1, ease: Elastic.easeOut }
			);
		}
	}, [isWrongLoginOrPw]);

	useEffect(() => {
		if (isWrongConfirmPW) {
			const element = document.querySelector(
				".has-text-centered.has-text-danger"
			);
			TweenMax.set(element, { y: 50 });
			TweenMax.fromTo(
				element,
				1,
				{ y: 50 },
				{ y: 0, opacity: 1, ease: Elastic.easeOut }
			);
		}
	}, [isWrongConfirmPW]);

	useEffect(() => {
		if (isModal) {
			const modalCard = document.querySelector("#modalCardLogin");
			const modalBackground = document.querySelector(
				"#modalBackgroundLogin"
			);
			TweenMax.set(modalCard, { y: 128, opacity: 0 });
			TweenMax.set(modalBackground, { opacity: 0 });
			TweenMax.fromTo(
				modalCard,
				0.65,
				{ y: 128 },
				{ y: 0, opacity: 1, ease: Power4.easeOut }
			);
			TweenMax.fromTo(
				modalBackground,
				0.45,
				{},
				{ opacity: 1, ease: Power4.easeOut }
			);
		}
	}, [isModal]);

	//Permite fechar o modal apertando ESC.
	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setModal(false);
			}
		};
		window.addEventListener("keydown", handleKey);

		return () => {
			window.removeEventListener("keydown", handleKey);
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const login_png = isNotMobile() ? (
		<figure className="image login">
			<img alt="" src="/img/login.png"></img>
		</figure>
	) : (
		<div></div>
	);

	return (
		<div className="Modal">
			<div className={`modal ${active}`} ref={modalRef}>
				{/*O handleClick abaixo serve para permitir que o modal
				possa ser fechado ao clicar fora dele.*/}
				<div
					id="modalBackgroundLogin"
					className="modal-background"
					onClick={handleModalClose}
				/>
				<div id="modalCardLogin" className="modal-card">
					<header
						className={
							"modal-card-head headBackground " + browser()
						}
					>
						<p
							className="modal-card-title ml-5"
							style={{
								whiteSpace: "pre-line",
								cursor: "default",
							}}
						>
							<i
								style={{
									fontSize: "35px",
									verticalAlign: "middle",
									opacity: "10%",
								}}
								className="icon-portal-in"
							></i>
							<span
								style={{
									marginLeft: "5px",
									marginRight: "5px",
									verticalAlign: "middle",
								}}
							>
								Alterar Senha
							</span>
							<i
								style={{
									fontSize: "35px",
									verticalAlign: "middle",
									opacity: "10%",
								}}
								className="icon-portal-out"
							></i>
						</p>
						<button
							onClick={handleModalClose}
							className="delete"
							aria-label="close"
						/>
					</header>
					<section className="modal-card-body">
						<div className="container">
							<div className="columns is-centered">
								<div className="column">
									<div className="box">
										<div className="field">
											{wrongLoginPw}
											{wrongConfirmPW}
											<label
												style={{
													zIndex: 1,
													position: "relative",
												}}
												htmlFor=""
												className="label"
											>
												<span
													style={{
														paddingRight: 100,
														paddingLeft: 100,
														paddingBottom: 50,
														backgroundColor:
															"white",
													}}
												>
													Usuário
												</span>
											</label>
											<div
												style={{
													zIndex: 1,
													position: "relative",
												}}
												className="control has-icons-left has-icons-right"
											>
												<input
													id="login"
													type="text"
													placeholder="digite o usuário aqui"
													className={
														"input has-text-centered is-info" +
														isDangerLogin
													}
													required
													value={login}
													onChange={(e) => {
														setIsWrongLoP(false);
														setDangerLogin("");
														setDangerPw("");
														setLogin(
															e.target.value
														);
													}}
													onKeyDown={handleEnter}
												></input>
												<span className="icon is-small is-left">
													<FontAwesomeIcon
														icon={icon({
															name: "user",
															style: "solid",
														})}
													/>
												</span>
												<span className="icon is-small is-right">
													<FontAwesomeIcon
														className="fa-blank"
														icon={icon({
															name: "user",
															style: "solid",
														})}
													/>
												</span>
											</div>
										</div>
										<div className="field">
											<label htmlFor="" className="label">
												Senha
											</label>
											<div className="control has-icons-left has-icons-right">
												<input
													id="password"
													type="password"
													placeholder="*******"
													className={
														"input has-text-centered is-info" +
														isDangerPw
													}
													required
													value={password}
													onChange={(e) => {
														setIsWrongLoP(false);
														setDangerLogin("");
														setDangerPw("");
														setPassword(
															e.target.value
														);
													}}
													onKeyDown={handleEnter}
												></input>
												<span className="icon is-small is-left">
													<FontAwesomeIcon
														icon={icon({
															name: "lock",
															style: "solid",
														})}
													/>
												</span>
												<span className="icon is-small is-right">
													<FontAwesomeIcon
														className="fa-blank"
														icon={icon({
															name: "lock",
															style: "solid",
														})}
													/>
												</span>
											</div>
										</div>

										<div className="field">
											<label htmlFor="" className="label">
												Nova Senha
											</label>
											<div className="control has-icons-left has-icons-right">
												<input
													id="new_password"
													type="password"
													placeholder="*******"
													className={
														"input has-text-centered is-info" +
														isDangerNewPW
													}
													required
													value={newPassword}
													onChange={(e) => {
														setIsWrongConfirmPW(
															false
														);
														setDangerNewPW("");
														setDangerConfirmPW("");
														setNewPassword(
															e.target.value
														);
													}}
													onKeyDown={handleEnter}
												></input>
												<span className="icon is-small is-left">
													<FontAwesomeIcon
														icon={icon({
															name: "lock",
															style: "solid",
														})}
													/>
												</span>
												<span className="icon is-small is-right">
													<FontAwesomeIcon
														className="fa-blank"
														icon={icon({
															name: "lock",
															style: "solid",
														})}
													/>
												</span>
											</div>
										</div>

										<div className="field">
											<label htmlFor="" className="label">
												Confirmar Senha
											</label>
											<div className="control has-icons-left has-icons-right">
												<input
													id="confirm_password"
													type="password"
													placeholder="*******"
													className={
														"input has-text-centered is-info" +
														isDangerConfirmPW
													}
													required
													value={confirmPassword}
													onChange={(e) => {
														setIsWrongConfirmPW(
															false
														);
														setDangerNewPW("");
														setDangerConfirmPW("");
														setConfirmPassword(
															e.target.value
														);
													}}
													onKeyDown={handleEnter}
												></input>
												<span className="icon is-small is-left">
													<FontAwesomeIcon
														icon={icon({
															name: "lock",
															style: "solid",
														})}
													/>
												</span>
												<span className="icon is-small is-right">
													<FontAwesomeIcon
														className="fa-blank"
														icon={icon({
															name: "lock",
															style: "solid",
														})}
													/>
												</span>
											</div>
										</div>

										<div className="field">
											<button
												className={
													"has-icons-right button is-success" +
													isLoading
												}
												onClick={checkNewPassword}
											>
												Alterar Senha&nbsp;&nbsp;
												<span className="icon is-small is-right">
													<FontAwesomeIcon
														icon={icon({
															name: "right-to-bracket",
															style: "solid",
														})}
													/>
												</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			<div className="buttons is-right px-6">
				<button
					className="button is-info has-icons-right"
					style={{
						whiteSpace: "pre-line",
					}}
					onClick={handleModalOpen}
				>
					Alterar Senha&nbsp;&nbsp;
					<span className="icon is-small is-right">
						<FontAwesomeIcon
							icon={icon({
								name: "right-to-bracket",
								style: "solid",
							})}
						/>
					</span>
				</button>
				{login_png}
			</div>
		</div>
	);
}
