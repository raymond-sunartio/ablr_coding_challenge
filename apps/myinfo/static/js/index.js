axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";

function formatDate(myinfoDateStr) {
    const month = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
	if (typeof myinfoDateStr !== 'string')
		console.log('what?!');
    const fields = myinfoDateStr.split('-');
    if ((fields.length < 2) || (fields.length > 3))
        return myinfoDateStr;
    var formattedDate = month[parseInt(fields[1]) - 1] + ' ' + fields[0];
    if (fields.length > 2)
        formattedDate = fields[2] + ' ' + formattedDate;
    return formattedDate;
}

function formatCurrency(myinfoAmount) {
    if (typeof myinfoAmount !== 'number')
        return myinfoAmount;
    return myinfoAmount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function formatYesNo(bool) {
    return bool ? 'Yes' : 'No';
}

function getNestedValue(props, dottedPath, defaultValue='') {
    const levels = dottedPath.split('.');
    let value = levels.reduce((props, level) => props && props[level], props);
    if (typeof value !== 'undefined')
        return value;
    return defaultValue;
}

class ContactInfo extends React.Component {
	constructor(props) {
		super(props);
	}
	
    render() {
        const contact_info_fields = {
            'Mobile Number': getNestedValue(this.props.data, 'mobile.nbr.value', ''),
            'Email Address': getNestedValue(this.props.data, 'email.value', ''),
        };
        const registered_address_fields = {
            'Block Number': getNestedValue(this.props.data, 'regadd.block.value', ''),
            'Street Name': getNestedValue(this.props.data, 'regadd.street.value', ''),
            'Building Name': getNestedValue(this.props.data, 'regadd.building.value', ''),
            'Floor & Unit No': '#' + getNestedValue(this.props.data, 'regadd.floor.value', '') +
                '-' + getNestedValue(this.props.data, 'regadd.unit.value', ''),
            'Postal Code': getNestedValue(this.props.data, 'regadd.postal.value', ''),
            'Type of Housing': getNestedValue(this.props.data, 'housingtype.desc', '') ||
                getNestedValue(this.props.data, 'hdbtype.desc', ''),
        };
        
        return (
            <div>
				<h5 className="myinfo-subsection">Contact Info</h5>
				<form>
                    {Object.keys(contact_info_fields).map((k, i) => {
                        return (
                            <div className="form-group mb-0" key={'key-' + i}>
                                <label className="text-muted myinfo-label">{k}</label>
                                <input type="text" readOnly className="form-control-plaintext myinfo-value" value={contact_info_fields[k]} />
                            </div>
                        )
                    })}
				</form>
                <h5 className="myinfo-subsection">Registered Address</h5>
				<form>
                    {Object.keys(registered_address_fields).map((k, i) => {
                        return (
                            <div className="form-group mb-0" key={'key-' + i}>
                                <label className="text-muted myinfo-label">{k}</label>
                                <input type="text" readOnly className="form-control-plaintext myinfo-value" value={registered_address_fields[k]} />
                            </div>
                        )
                    })}
				</form>
			</div>
        );
    }
}

class PersonalInfo extends React.Component {
	constructor(props) {
		super(props);
	}
    
    render() {
        const personal_info_fields = {
            'NRIC/FIN': getNestedValue(this.props.data, 'uinfin.value', ''),
            'Principal Name': getNestedValue(this.props.data, 'name.value', ''),
            'Sex': getNestedValue(this.props.data, 'sex.desc', ''),
            'Date of Birth': formatDate(getNestedValue(this.props.data, 'dob.value', '')),
            'Country of Birth': getNestedValue(this.props.data, 'birthcountry.desc', ''),
            'Residential Status': getNestedValue(this.props.data, 'residentialstatus.desc', ''),
            'Nationality': getNestedValue(this.props.data, 'nationality.desc', ''),
            'Race': getNestedValue(this.props.data, 'race.desc', ''),
            'Marital Status': getNestedValue(this.props.data, 'marital.desc', ''),
        };

        return (
            <div>
				<h5 className="myinfo-subsection">Personal Info</h5>
				<form>
                    {Object.keys(personal_info_fields).map((k, i) => {
                        return (
                            <div className="form-group mb-0" key={'key-' + i}>
                                <label className="text-muted myinfo-label">{k}</label>
                                <input type="text" readOnly className="form-control-plaintext myinfo-value" value={personal_info_fields[k]} />
                            </div>
                        )
                    })}
				</form>
			</div>
        );
    }
}

class NoticeOfAssessmentHistory extends React.Component {
    constructor(props) {
		super(props);
	}
    
    render() {
        // when NoA history is unavailable
        if (getNestedValue(this.props.data, 'noahistory.unavailable', false))
            return (<div><h5 className="myinfo-subsection">Notice Of Assessment (History)</h5></div>);
        
        // consider only the last 2 assessments, transpose
        const noas = getNestedValue(this.props.data, 'noahistory.noas', []).slice(0, 2);
        const rows = [
			{
                label: 'Year of Assessment',
                values: noas.map(({yearofassessment}) => yearofassessment.value),
                isBold: true,
            },
            {
                label: 'Employment',
                values: noas.map(({employment}) => formatCurrency(employment.value)),
                isBold: false,
            },
            {
                label: 'Trade',
                values: noas.map(({trade}) => formatCurrency(trade.value)),
                isBold: false,
            },
            {
                label: 'Interest',
                values: noas.map(({interest}) => formatCurrency(interest.value)),
                isBold: false,
            },
            {
                label: 'Rent',
                values: noas.map(({rent}) => formatCurrency(rent.value)),
                isBold: false,
            },
            {
                label: 'Total Income',
                values: noas.map(({amount}) => formatCurrency(amount.value)),
                isBold: true,
            },
            {
                label: 'Tax Clearance',
                values: noas.map(({taxclearance}) => taxclearance.value),
                isBold: true,
            },
        ]
        
        return (
            <div>
                <h5 className="myinfo-subsection">Notice Of Assessment (History)</h5>
                <table className="table table-sm table-borderless text-muted">
                    <tbody>
                        {rows.map((row, index) => {
                            return (
                                <tr key={'key-' + index}>
                                    <td className={'text-muted' + (row.isBold ? ' font-weight-bold' : '')}>{row.label}</td>
                                    {row.values.map((value, index) => {
                                        return (<td key={'key-' + index} className={'text-muted text-right' + (row.isBold ? ' font-weight-bold' : '')}>{value}</td>);
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

class OtherIncomeInformation extends React.Component {
    constructor(props) {
		super(props);
	}
    
    render() {
        const other_income_fields = {
            'Ownership of Private Residential Property': formatYesNo(getNestedValue(this.props.data, 'ownerprivate.value', false)),
        };

        return (
            <div>
				<h5 className="myinfo-subsection">Other Income Information</h5>
				<form>
                    {Object.keys(other_income_fields).map((k, i) => {
                        return (
                            <div className="form-group mb-0" key={'key-' + i}>
                                <label className="text-muted myinfo-label">{k}</label>
                                <input type="text" readOnly className="form-control-plaintext myinfo-value" value={other_income_fields[k]} />
                            </div>
                        )
                    })}
				</form>
			</div>
        );
    }
}

class CPFAccountBalance extends React.Component {
    constructor(props) {
		super(props);
	}
    
    render() {
        const cpf_balance_fields = {
            'Ordinary Account (OA) (S$)': formatCurrency(getNestedValue(this.props.data, 'cpfbalances.oa.value', '')),
            'Special Account (SA) (S$)': formatCurrency(getNestedValue(this.props.data, 'cpfbalances.sa.value', '')),
            'Medisave Account (MA) (S$)': formatCurrency(getNestedValue(this.props.data, 'cpfbalances.ma.value', '')),
        };
		
        return (
            <div>
				<h5 className="myinfo-subsection">CPF Account Balance</h5>
				<form>
                    {Object.keys(cpf_balance_fields).map((k, i) => {
                        return (
                            <div className="form-group mb-0 row" key={'key-' + i}>
                                <label className="text-muted myinfo-label col">{k}</label>
                                <input type="text" readOnly className="form-control-plaintext myinfo-value col text-right" value={cpf_balance_fields[k]} />
                            </div>
                        )
                    })}
				</form>
			</div>
        );
    }
}

class CPFContributionHistory extends React.Component {
    constructor(props) {
		super(props);
	}
    
    render() {
        // when CPF contribution history is unavailable
        if (getNestedValue(this.props.data, 'cpfcontributions.unavailable', false))
            return (<div><h5 className="myinfo-subsection">CPF Contribution History</h5></div>);
        
        // consider only the last 6 months
        const contributions = getNestedValue(this.props.data, 'cpfcontributions.history', []).slice(-6).reverse();
		const headers = [
			{
				label: 'For Month',
				align: 'center',
			},
			{
				label: 'Paid On',
				align: 'center',
			},
			{
				label: 'Amount (S$)',
				align: 'right',
			},
			{
				label: 'Employer',
				align: 'left',
			},
		];
		const rows = [];
		for (var contribution of contributions) {
			rows.push([
				formatDate(contribution.month.value),
				formatDate(contribution.date.value),
				formatCurrency(contribution.amount.value),
				contribution.employer.value,
			]);
		}
        
        return (
            <div>
                <h5 className="myinfo-subsection">CPF Contribution History</h5>
                <table className="table table-sm table-borderless table-striped text-muted">
                    <thead>
                        <tr>
                            {headers.map((header, index) => {
                                return <th key={'key-' + index} scope="col" className={'pl-2 pr-2 text-' + header.align}>{header.label}</th>;
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            return (
                                <tr key={'key-' + index}>
                                    {row.map((col, index) => {
                                        return <td key={'key-' + index} className={'pl-2 pr-2 text-' + headers[index].align}>{col}</td>;
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

class IncomeInfo extends React.Component {
    constructor(props) {
		super(props);
	}
    
    render() {
        return (
            <div>
				<NoticeOfAssessmentHistory data={this.props.data} />
                <OtherIncomeInformation data={this.props.data} />
                <CPFAccountBalance data={this.props.data} />
				<CPFContributionHistory data={this.props.data} />
			</div>
        );
    }
}

class MyInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // we are still waiting for myinfo data to come from backend, show spinner
        if (this.props.isLoading)
            return (
                <div className="text-center">
                    <div className="spinner-grow text-primary">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <div className="spinner-grow text-primary">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <div className="spinner-grow text-primary">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            );
        
        // myinfo data will be null at the start or when there's error during
        // retrieval of myinfo, show empty div
        if (!this.props.data)
            return <div></div>;
        
        return (
            <div>
                <ul className="nav nav-pills nav-justified">
                    <li className="nav-item">
                        <a className="nav-link active" data-toggle="tab" href="#contact">Contact Info</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" data-toggle="tab" href="#personal">Personal Info</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" data-toggle="tab" href="#income">Income Info</a>
                    </li>
                </ul>
                <div className="tab-content">
                    <div className="tab-pane fade show active" id="contact">
                        <ContactInfo data={this.props.data}/>
                    </div>
                    <div className="tab-pane fade" id="personal">
                        <PersonalInfo data={this.props.data}/>
                    </div>
                    <div className="tab-pane fade" id="income">
                        <IncomeInfo data={this.props.data}/>
                    </div>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            myinfo: null,
        };
    }
    
    getAuthoriseUrl() {
        axios.get('/getAuthoriseUrl/')
            .then(
                (response) => {
                    console.log(response);
                    window.location = response.data.data.authorise_url;
                },
                (error) => {
                    console.log(error);
					alert(error.message)
                }
            );
    }
    
    getPerson(code) {
        axios.post('/getPerson/', {code: code})
            .then(
                (response) => {
                    console.log(response);
                    
                    // oops, something is wrong
                    if (response.data.status != 'OK') {
                        this.setState({
                            isLoading: false,
                            myinfo: null,
                        });
                        alert(response.data.details.message);
                        return;
                    }
                    
                    this.setState({
                        isLoading: false,
                        myinfo: response.data.data.person,
                    });
                },
                (error) => {
                    console.log(error);
                    this.setState({
                        isLoading: false,
                        myinfo: null,
                    });
					alert(error.message);
                }
            );
    }
    
    componentDidMount() {
        if (window.location.href.indexOf('callback') > -1) {
            this.setState({
                isLoading: true,
            });
            const params = new URLSearchParams(window.location.search);
            this.getPerson(params.get('code'));
        }
    }
    
    render() {
        return (
            <div className="container">
                <nav className="navbar navbar-light mb-2">
                    <button
                        type="button"
                        className="btn btn-outline-primary mx-auto"
                        onClick={() => this.getAuthoriseUrl()}>
                        Retrieve MyInfo
                    </button>
                </nav>
                <MyInfo isLoading={this.state.isLoading} data={this.state.myinfo} />
            </div>
        );
    }
}

// ============================================================================

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.querySelector('#root')
);
