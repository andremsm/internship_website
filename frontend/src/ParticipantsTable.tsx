import { ParticipantsTableProps } from "./Interface";

export function ParticipantsTable(props: ParticipantsTableProps) {
	if (props.ParticipantList.length > 0)
		return (
			<table className="table is-fullwidth is-hoverable">
				<thead>
					<tr>
						<th className="has-text-centered">Nome</th>
						<th className="has-text-centered">Unidade</th>
					</tr>
				</thead>
				<tbody>{props.ParticipantList}</tbody>
			</table>
		);
	else return <div></div>;
}
