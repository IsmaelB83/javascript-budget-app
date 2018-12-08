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
    let BudgetItem = function(description, value) {
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
    Budget.prototype.addItem = function(type, description, value) {
        switch(type) {
            case 'expense': 
                this.listOfExpenses.push(new BudgetItem(description,value));
                this.totalExpense += Number(value).toFixed(2);
                this.total += Number(value).toFixed(2);    
                break;
            case 'income':
                this.listOfIncomes.push(new BudgetItem(description,value));
                this.totalIncome += Number(value).toFixed(2);
                this.total += Number(value).toFixed(2);    
                break;
        }
    };
    
    Budget.prototype.removeItem = function(type, index) {
        let item;
        switch (type) {
            case 'expense':                
                item = this.listOfExpenses(index);
                this.listOfExpenses.splice(index,1);
                this.total += item.value;
                this.totalExpense -= item.value
                break;        
            case 'income':
                item = this.listOfIncomes(index);
                this.listOfIncomes.splice(index,1);
                this.total -= item.value;
                this.totalIncome -= item.value
                break;
        }
    };

    Budget.prototype.getStatus = function () {
        return  status = {
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
        getStatus: budget.getStatus.bind(budget),
        addItem: budget.addItem.bind(budget),
        removeItem: budget.removeItem.bind(budget),
        getExpenses: budget.getItems.bind(budget,'expenses'),
        getIncomes: budget.getItems.bind(budget,'incomes'),
    };
    

})('December', 2018);

// VIEW
var BudgetView = (function() {
    
    getNewItem = function () {
        return {
            type: document.querySelector('.add__type').value,
            description: document.querySelector('.add__description').value,
            value: Number(document.querySelector('.add__value').value).toFixed(2),
        };
    };
    
    return {
        newItem: this.getNewItem.bind(this),
    };

})();

// CONTROLLER
var BudgetController = (function() {

    // Event listeners to add new expense/income register
    document.querySelector('.add__btn').addEventListener('click', addRegister);
    document.addEventListener('keypress', function(event) { 
        if (event.key === 'Enter') {
            addRegister();
        }
    });
    // Event listener to remove expense/income register
    // document.querySelector('.item__delete--btn').addEventListener('click', addRegister);

    function addRegister() {
        let newItem = BudgetView.newItem();
        let type = newItem.type === 'exp' ? 'expense' : 'income';
        BudgetModel.addItem(type, newItem.description, newItem.value);
        console.log('New item added: ' + newItem.type + ' - ' + newItem.description + ' - ' + newItem.value);
        console.log('Actualizando budget...');
        console.log(BudgetModel.getStatus());
        console.log(BudgetModel.getExpenses());
        console.log(BudgetModel.getIncomes());
    }

})();