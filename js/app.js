/**************************************************************
 *  AUTHOR: Ismael (ismaelbernal@gmail.com)                   *
 *  DATE: 08.12.2018                                          *
 *  DESCRIPTION:                                              *
 *  ----------------------------------------------------------*
 *  Simple project to handle a webapp for                     *
 *  personal budget. The webapp implements the MVC design     *
 *  patter in Javascript. This webapp does not have any       *
 *  backend capabilities yet, but could be enhanced with      *
 *  and API rest backend written in NodeJS/Flask/etc.         *
 *  in order to manage our budgets with DB persistancy.       *
 * ************************************************************/

// MODEL
var BudgetModel = (function(month, year) {
    // Function constructor of a Budget Item
    let BudgetItem = function(id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this.value = parseFloat(value);
        this.percentage = percentage;
    };

    // Function constructor of a Budget object
    let Budget = function(month, year) {
        this.month = month;
        this.year = year;
        this.total = 0;
        this.totalIncome = 0;
        this.totalExpense = 0;
        this.percExpense = 0;
        this.listOfIncomes = [];
        this.listOfExpenses = [];
    };

    // Methods for Budget class
    Budget.prototype.addItem = function(type, id, description, value) {
        let percentage = 0;
        switch(type) {
            case 'expense': 
                if (Math.abs(this.totalIncome)>0) {
                    percentage = ((value/this.totalIncome)*100).toFixed(1);
                } else {
                    percentage = '100.0';
                }    
                this.listOfExpenses.push(new BudgetItem(id, description, value, percentage));
                this.totalExpense += value;
                this.total -= value;
                break;
            case 'income':
                this.listOfIncomes.push(new BudgetItem(id, description, value, 0));
                this.totalIncome += value;
                this.total += value;
                break;
        }
        // Calculate % expense over income
        if (Math.abs(this.totalIncome)>0) {
            this.percExpense = ((this.totalExpense/this.totalIncome)*100).toFixed(1);
        } else {
            this.percExpense = '0.0';
        }
        this.updatePercentages ();
        return percentage;
    };

    Budget.prototype.updatePercentages = function(type) {
        this.listOfExpenses.forEach(element => {
            element.percentage = element.value / this.totalIncome * 100;
        });
    };
    
    Budget.prototype.removeItem = function(type, id) {
        let item;
        switch (type) {
            case 'expense':
                for (let i = 0; i < this.listOfExpenses.length; i++) {
                    if (this.listOfExpenses[i].id === id) {
                        item = this.listOfExpenses[i];
                        this.listOfExpenses.splice(i,1);
                        break;
                    }
                }
                this.total += item.value;
                this.totalExpense -= item.value
                break;        
            case 'income':
                for (let i = 0; i < this.listOfIncomes.length; i++) {
                    if (this.listOfIncomes[i].id === id) {
                        item = this.listOfIncomes[i];
                        this.listOfIncomes.splice(i,1);
                        break;
                    }
                }
                this.total -= item.value;
                this.totalIncome -= item.value
                break;
        }
        this.updatePercentages ();
    };

    Budget.prototype.getStatus = function () {
        return  status = {
            date: budget.month + ' ' + budget.year,
            total: budget.total,
            income: budget.totalIncome,
            expense: budget.totalExpense,
            percentage: budget.percExpense,
        };
    };

    Budget.prototype.getItems = function (type) {
        switch (type) {
            case 'expenses':
                return this.listOfExpenses;
            case 'incomes':
                return this.listOfIncomes;
        }
    };

    // Attributes of the model
    var budget = new Budget(month, year);

    // Return public section of Budget
    return publicModel = {
        // Global budget status
        getStatus: budget.getStatus.bind(budget),
        // Expenses
        addExpense: budget.addItem.bind(budget, 'expense'),
        removeExpense: budget.removeItem.bind(budget, 'expense'),
        getExpenses: budget.getItems.bind(budget, 'expenses'),
        // Incomes
        addIncome: budget.addItem.bind(budget, 'income'),
        removeIncome: budget.removeItem.bind(budget, 'income'),
        getIncomes: budget.getItems.bind(budget, 'incomes'),
    };
    

})('December', 2018);

// VIEW
var BudgetView = (function(month, year) {
    
    // String to access main objects in the DOM
    let idStringsDOM = {
        budgetTotalClass: '.budget__value',
        budgetIncomeClass: '.budget__income--value',
        budgetExpensesClass: '.budget__expenses--value',
        budgetPercentageClass: '.budget__expenses--percentage',
        deleteItemClass: '.item__delete--btn',
        expensesListClass: '.expenses__list',
        incomeListClass: '.income__list',
        addTypeClass: '.add__type',
        addDescriptionClass: '.add__description',
        addValueClass: '.add__value',
        addButtonClass: '.add__btn',
        itemValueClass: '.item__value',
        itemPercClas: '.item__percentage'
    }

    addItem = function (type, id, description, value, percentage, eventHandler) {
        let html = "", lista;
        if (type === 'expense') {
            lista = document.querySelector(idStringsDOM.expensesListClass);
        } else if (type === 'income') {
            lista = document.querySelector(idStringsDOM.incomeListClass);
        }
        html += '<div class="item clearfix" id="' + id + '">';
        html += '<div class="item__description">' + description + '</div>';
        html += '<div class="right clearfix"><div class="item__value">' + parseFloat(value).toFixed(2) + '</div>';
        if (type === 'expense') {
            html += '<div class="item__percentage">' + percentage + ' %</div>';
        }
        html += '<div class="item__delete">';
        html += '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
        html += '</div></div></div>';
        // Instead of using lista.innnerHTML += html which will destroy all previous eventhandlers of the "delete" buttons
        lista.insertAdjacentHTML('beforeend', html);
        // Add event listener to handle delete operation (refers to controller)
        document.getElementById(id).querySelector(idStringsDOM.deleteItemClass).addEventListener('click', eventHandler);
    };

    updatePercentages = function(totalIncome) {
        let nodos = document.querySelector(idStringsDOM.expensesListClass).querySelectorAll('.item');
        nodos.forEach(element => {
            let expense = element.querySelector(idStringsDOM.itemValueClass);
            let percen = element.querySelector(idStringsDOM.itemPercClas);
            if (parseFloat(totalIncome)>0) {
                let aux = ((parseFloat(expense.textContent)/totalIncome) * 100).toFixed(1);
                percen.textContent = aux + ' %';
            } else {
                percen.textContent = '100.0 %';
            }
        });
    }

    return {
        // Global init
        init: function() 
            {
                this.setBudget(0.00,0.00,0.00); 
                document.querySelector(".budget__title--month").textContent = month + ' ' + year;
            },
        // Getters
        getDOM: function() 
            { 
                return idStringsDOM; 
            },
        getInput: function() 
            {
                return {
                    type: document.querySelector(idStringsDOM.addTypeClass).value,
                    description: document.querySelector(idStringsDOM.addDescriptionClass).value,
                    value: parseFloat(document.querySelector(idStringsDOM.addValueClass).value),
                };
            },
        // Setters
        setBudget: function(total, incomes, expenses) 
            {
                document.querySelector(idStringsDOM.budgetTotalClass).textContent = total.toFixed(2);
                document.querySelector(idStringsDOM.budgetIncomeClass).textContent = '+ ' + parseFloat(incomes).toFixed(2);
                document.querySelector(idStringsDOM.budgetExpensesClass).textContent = '- ' + parseFloat(expenses).toFixed(2);
                if (parseFloat(incomes)>0) {
                    document.querySelector(idStringsDOM.budgetPercentageClass).textContent = ((expenses/incomes)*100).toFixed(1) + ' %';
                } else if (parseFloat(expenses)>0) {
                    document.querySelector(idStringsDOM.budgetPercentageClass).textContent = '100.0 %';
                } else {
                    document.querySelector(idStringsDOM.budgetPercentageClass).textContent = '0.0 %';
                }
                updatePercentages(incomes);
            },
        setInput: function (type, description, value) 
            {
                document.querySelector(idStringsDOM.addTypeClass).value = type;
                document.querySelector(idStringsDOM.addDescriptionClass).value = '';
                document.querySelector(idStringsDOM.addValueClass).value = 0;
                document.querySelector(idStringsDOM.addDescriptionClass).focus();
            },
        typeChange: function () 
            {
                document.querySelector(idStringsDOM.addButtonClass).classList.toggle("red");
            },
        // List of expenses / income
        addExpense: this.addItem.bind(this,'expense'),
        addIncome:  this.addItem.bind(this,'income'),
        removeItem: function(node) 
            {
                let parent = node.parentElement;
                parent.removeChild(node);
            },
    };

})('December', 2018);

// CONTROLLER
var BudgetController = (function(model,view) {

    // Add event listeners to add new expense/income register
    var setUpEventListeners = function () {
        var DOM = view.getDOM();
        document.querySelector(DOM.addButtonClass).addEventListener('click', addRegister);
        document.addEventListener('keypress', function(event) { 
            if (event.key === 'Enter') {
                addRegister();
            }
        });
        document.querySelector(DOM.addTypeClass).addEventListener('change', function(event) {
            view.typeChange();
        });
    }

    // Event handler to create new items (income or expense)
    function addRegister() {
        // Get info input from View
        let newItem = view.getInput(), status, id, percentage;
        if (newItem.description !== '' && newItem.value > 0) {
            switch(newItem.type) {
                case 'exp':
                    // Update model and then view
                    id = 'expense-' + model.getExpenses().length;
                    percentage = model.addExpense (id, newItem.description, newItem.value);
                    view.addExpense(id, newItem.description, newItem.value, percentage, deleteRegister);
                    view.setInput('exp','',0);
                    break;
                case 'inc': 
                    // Update model and then view
                    id = 'income-' + model.getIncomes().length;
                    model.addIncome (id, newItem.description, newItem.value);
                    view.addIncome(id, newItem.description, newItem.value, 0, deleteRegister)
                    view.setInput('inc','',0);
                    break;
            }
            status = model.getStatus();
            view.setBudget(status.total, status.income, status.expense, status.percentage);
            // view.updatePercentages();
        }
    }

    // Event handler to delete existing items (income or expense)
    function deleteRegister(event) {
        let nodo, status;
        nodo = event.srcElement.parentElement.parentElement.parentElement.parentElement;
        if (nodo.id.split("-")[0] === 'income') {
            model.removeIncome(nodo.id);
        } else {
            model.removeExpense(nodo.id);
        }
        view.removeItem(event.srcElement.parentElement.parentElement.parentElement.parentElement);
        status = model.getStatus();
        view.setBudget(status.total, status.income, status.expense);
    }

    // Initilization function 
    return {
        init: function () {
            console.log('Application has started');
            console.log('-----------------------');
            console.log('- Adding event listeners... ok');
            setUpEventListeners();
            console.log('- Render UI... ok');
            view.init();
            console.log('- Connecting to REST API... ko');
            console.log('- Loading user profile... ko');
        }
    };

})(BudgetModel,BudgetView);

// Start application by starting the controller
BudgetController.init()