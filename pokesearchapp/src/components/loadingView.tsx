import {Table} from 'react-bootstrap'

const loadingView = () => {
    return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Type 1</th>
          <th>Type 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Loading...</td>
          <td>Loading...</td>
          <td>Loading...</td>
          <td>Loading...</td>
        </tr>
      </tbody>
    </Table>
    )
  }
export default loadingView;