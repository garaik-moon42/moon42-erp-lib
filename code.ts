// import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

function formatMySqlDate_(date:Date):string {
    let local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
}

type ResultRowTransformer = (rs: GoogleAppsScript.JDBC.JdbcResultSet) => any;

function runSql_(sql:string, resultRowTransformer:ResultRowTransformer):any[] {
  let conn = Jdbc.getConnection('jdbc:mysql://93.189.113.202:33066/pm3', 'pm3', 'notroot');
  let stmt = conn.createStatement();
  let result = stmt.executeQuery(sql);
  let data = [];
  while (result.next()) {
    data.push(resultRowTransformer(result));
  }
  result.close();
  stmt.close();
  conn.close();
  return data;
}

/**
 * Lists the currently active projects from the PM.
 * @return Array of project ids.
 * @customfunction
 */
function PROJECTS():string[] {
    return runSql_(
        "select P.om_object from om_value_project P where P.mt_active = 1 and P.mt_archive = 0",
        (rs: GoogleAppsScript.JDBC.JdbcResultSet) => {
            return rs.getString(1);
        }
    );
}

/**
 * Returns the name of the project with the given ID.
 * @param projectId Id of the project to retrieve the name of.
 * @return Name of the project or null if the project cannot be found.
 * @customfunction
 */
function NAME_OF_PROJECT(projectId: string):string|null {
    const pidRegex = /^\d+$/gm; // to avoid SQL injection we test the projectId against this regex. It must be a number.
    const m = pidRegex.exec(projectId);
    if (projectId !== null && projectId.match(pidRegex)) {
        const res = runSql_(
            `select P.mt_name from om_value_project P where P.om_object = '${projectId}'`,
            (rs: GoogleAppsScript.JDBC.JdbcResultSet) => { return rs.getString(1); }
        );
        return res.length > 0 ? res[0] : null;
    }
    throw "Project ID must contain only digits and must not be null.";
}
