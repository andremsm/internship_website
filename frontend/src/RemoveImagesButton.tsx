import { ModalRemoveImgProps } from "./Interface";
import { getCurrentUser } from "./Utils";

export function RemoveImagesButton(props: ModalRemoveImgProps) {
	if (getCurrentUser() && props.length > 0)
		return (
			<div className="buttons is-centered">
				<button
					className="button is-info"
					style={{
						whiteSpace: "pre-line",
					}}
					onClick={props.handleInnerModalOpen}
				>
					Remover imagens
				</button>
			</div>
		);
	else return <div></div>;
}
