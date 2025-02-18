import { NewsProps } from "./Interface";
import { textoNoticia } from "./Utils";

export function News(props: NewsProps) {
	if (props.URL)
		return (
			<a href={props.URL} target="_blank" rel="noopener noreferrer">
				<button
					className="button is-info is-outlined"
					style={{
						whiteSpace: "pre-line",
					}}
				>
					{textoNoticia()}
				</button>
			</a>
		);
	else return <div></div>;
}
