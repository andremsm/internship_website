import { RmvImgsModalProps } from "./Interface";
import { authExpiration, getCurrentUser } from "./Utils";

export function RemoveImagesModal(props: RmvImgsModalProps) {
	const handleSelectThumb = (item: string) => {
		const check = props.selectedThumbs.includes(item);
		if (check) {
			const updatedList = props.selectedThumbs.filter(
				(thumb) => thumb !== item
			);
			props.setSelectedThumbs(updatedList);
		} else {
			props.setSelectedThumbs([...props.selectedThumbs, item]);
		}
	};

	const imgThumbs = () => {
		return props.ImagensPath.map((item: string, index: number) => {
			const itemStr = `${props.index} - ${props.title}/${item}`;
			const isSelected = props.selectedThumbs.includes(itemStr);
			return (
				<td
					key={`imgThumb${props.title}_${item}`}
					style={{ padding: "10px" }}
				>
					<img
						src={`img/curso_compressed/${itemStr}`}
						alt={`${item}`}
						id={itemStr}
						className={
							"clickable " + (isSelected ? "img-selected" : "")
						}
						onClick={() => handleSelectThumb(itemStr)}
					></img>
				</td>
			);
		});
	};

	const sendRemoveImages = () => {
		//console.log(selectedThumbs);
		//console.log("sending images to delete...");
		if (props.selectedThumbs.length < 1) {
			//console.log("fail");
			return;
		}

		const access_token = authExpiration!() as string;

		const data = new FormData();
		data.append("title", props.title);
		data.append("folderName", props.folder);
		data.append(
			"imageList",
			JSON.stringify(
				props.selectedThumbs.map((item) => {
					return item.split("/").slice(-1);
				})
			)
		);

		//console.log(data);
		//console.log("fetching...");

		fetch("http://localhost:8080/api/img/delete", {
			method: "POST",
			headers: {
				"x-access-token": access_token,
			},
			body: data,
		})
			.then((res) => res.json())
			.then((data) => console.log(data))
			.catch((err) => console.log(err));

		window.history.back();
		window.history.back();
		props.navigate("/", { replace: true });
		window.location.reload();
	};

	if (getCurrentUser())
		return (
			<div className={`modal ${props.activeInner}`}>
				{/*O handleClick abaixo serve para permitir que o modal
					possa ser fechado ao clicar fora dele.*/}
				<div
					id={`modalBackground${props.index}i`}
					className="modal-background"
					onClick={props.handleInnerModalClose}
				/>
				<div id={`modalCard${props.index}i`} className="modal-card">
					<header
						className="modal-card-head"
						style={{ backgroundColor: "#e6fcfc" }}
					>
						<p
							className="modal-card-title"
							style={{
								whiteSpace: "pre-line",
							}}
						>
							{props.title}
						</p>
						<button
							onClick={props.handleInnerModalClose}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">Remover imagens</p>
					</header>
					<section className="modal-card-body">
						<table className="buttons is-centered">
							<tbody>
								<tr>{imgThumbs()}</tr>
							</tbody>
						</table>

						<div className="buttons is-centered">
							<button
								className="button is-info"
								style={{
									whiteSpace: "pre-line",
								}}
								onClick={sendRemoveImages}
							>
								Remover imagens
							</button>
						</div>

						{/*put this part inside if_logged_in() */}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
		);
	else return <div></div>;
}
