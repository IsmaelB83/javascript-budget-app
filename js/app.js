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
    let BudgetItem = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Function constructor of a Budget object
    let Budget = function(month, year) {
        this.month = month;
        this.year = year;
        this.total = 0;
        this.totalIncome = 0;
        this.totalExpense = 0;
        this.listOfIncomes = [];
        this.listOfExpenses = [];
    };

    // Methods for Budget class
    Budget.prototype.addItem = function(type, id, description, value) {
        let auxValue = parseFloat(value);
        switch(type) {
            case 'expense': 
                this.listOfExpenses.push(new BudgetItem(id, description,value));
                this.totalExpense += auxValue
                this.total -= auxValue
                break;
            case 'income':
                this.listOfIncomes.push(new BudgetItem(id, description,value));
                this.totalIncome += auxValue;
                this.total += auxValue;
                break;
        }
    };
    
    Budget.prototype.removeItem = function(type, id) {
        let item;
        switch (type) {
            case 'expense':
                for (i=0;i<this.listOfExpenses.length;i++) {
                    if (this.listOfExpenses[i].id === id) {
                        item = this.listOfExpenses[i];
                        break;
                    }
                }
                this.listOfExpenses.splice(i,1);
                this.total += item.value;
                this.totalExpense -= item.value
                break;        
            case 'income':
                for (i=0;i<this.listOfIncomes.length;i++) {
                    if (this.listOfIncomes[i].id === id) {
                        item = this.listOfIncomes[i];
                        break;
                    }
                }
                this.listOfIncomes.splice(i,1);
                this.total -= item.value;
                this.totalIncome -= item.value
                break;
        }
    };

    Budget.prototype.getStatus = function () {
        return  status = {
            date: budget.month + ' ' + budget.year,
            total: Number(budget.total).toFixed(2),
            income: Number(budget.totalIncome).toFixed(2),
            expense: Number(budget.totalExpense).toFixed(2),
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
    
    document.querySelector(".budget__title--month").textContent = month + ' ' + year;

    addItem = function (type, id, description, value, eventHandler) {
        let html = "", lista;
        if (type === 'expense') {
            lista = document.querySelector(".expenses__list");
        } else if (type === 'income') {
            lista = document.querySelector(".income__list");
        }
        html += '<div class="item clearfix" id="' + id + '">';
        html += '<div class="item__description">' + description + '</div>';
        html += '<div class="right clearfix"><div class="item__value">' + parseFloat(value).toFixed(2) + '</div>';
        html += '<div class="item__delete">';
        html += '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
        html += '</div></div></div>';
        lista.innerHTML += html;
        // Add event listener to handle delete operation (refers to controller)
        let buttons = document.getElementsByClassName('item__delete--btn');
        for (i=0;i<buttons.length;i++) {
            buttons[i].addEventListener('click', eventHandler);
        }
    };

    removeItem = function (type, node) {
        // Delete node
        let parent = node.parentElement;
        parent.removeChild(node);
    };

    getInput = function () {
        return {
            type: document.querySelector('.add__type').value,
            description: document.querySelector('.add__description').value,
            value: parseFloat(document.querySelector('.add__value').value),
        };
    };

    clearInput = function () {
        document.querySelector('.add__description').value = '';
        document.querySelector('.add__value').value = 0;
    };

    typeSelected = function () {
        document.querySelector('.add__btn').classList.toggle("red");
    };

    updateBudget = function(total, incomes, expenses) {
        total = parseFloat(incomes) - parseFloat(expenses);
        let percentage = total !== 0 ? (parseFloat(expenses) / parseFloat(total).toFixed(2)) : 0;
        let signo = total >= 0 ? '+ ' : '- ';
        document.querySelector(".budget__value").textContent = signo + Math.abs(parseFloat(total).toFixed(2));
        document.querySelector(".budget__income--value").textContent = '+ ' + parseFloat(incomes).toFixed(2);
        document.querySelector(".budget__expenses--value").textContent = '- ' + parseFloat(expenses).toFixed(2);
        document.querySelector(".budget__expenses--percentage").textContent = parseFloat(percentage).toFixed(2) + '%';
    };

    this.updateBudget(0.00,0.00,0.00);

    return {
        // Global budget status
        updateBudget: this.updateBudget.bind(this),
        // Input
        getInput: this.getInput.bind(this),
        clearInput: this.clearInput.bind(this),
        typeSelected: this.typeSelected.bind(this),
        // Expenses
        addExpense: this.addItem.bind(this,'expense'),
        removeExpense: this.removeItem.bind(this,'expense'),
        // Incomes
        addIncome: this.addItem.bind(this,'income'),
        removeIncome: this.removeItem.bind(this,'income'),
    };

})('December', 2018);

// CONTROLLER
var BudgetController = (function(model,view) {

    // Add event listeners to add new expense/income register
    document.querySelector('.add__btn').addEventListener('click', addRegister);
    document.addEventListener('keypress', function(event) { 
        if (event.key === 'Enter') {
            addRegister();
        }
    });
    document.querySelector(".add__type").addEventListener('change', function(event) {
        view.typeSelected();
    });

    // Event handler to create new items (income or expense)
    function addRegister() {
        // Get info input from View
        let newItem = view.getInput(), status, id;
        if (newItem.description !== '' && newItem.value > 0) {
            switch(newItem.type) {
                case 'exp':
                    // Update model and then view
                    id = 'expense-' + model.getExpenses().length;
                    model.addExpense (id, newItem.description, newItem.value);
                    status = model.getStatus();
                    view.addExpense(id, newItem.description, newItem.value, deleteRegister)
                    view.clearInput();
                    view.updateBudget(status.total, status.income, status.expense);
                    break;
                case 'inc': 
                    // Update model and then view
                    id = 'income-' + model.getIncomes().length;
                    model.addIncome (id, newItem.description, newItem.value);
                    status = model.getStatus();
                    view.addIncome(id, newItem.description, newItem.value, deleteRegister)
                    view.clearInput();
                    view.updateBudget(status.total, status.income, status.expense);
                    break;
            }
        }
    }

    // Event handler to delete existing items (income or expense)
    function deleteRegister(event) {
        let nodo = event.srcElement.parentElement.parentElement.parentElement.parentElement;
        switch (nodo.id.split("-")[0]) {
            case 'income':
                model.removeIncome(nodo.id);
                view.removeIncome(event.srcElement.parentElement.parentElement.parentElement.parentElement);
                break;
            case 'expense':
                model.removeExpense(nodo.id);
                view.removeExpense(event.srcElement.parentElement.parentElement.parentElement.parentElement);
                break;
        }
        let status = model.getStatus();
        view.updateBudget(status.total, status.income, status.expense);
    }


})(BudgetModel,BudgetView);