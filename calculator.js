/*
 *
Monthly Payment Algorithm	use the PMT formula

  Loan * ((Monthly Interest * (1 + Monthly Interest) ^ Term in Months) / (((1 + Monthly Interest) ^ Term in Months) - 1))
  PMT(rate, number_of_periods, present_value, [future_value], [end_or_beginning])

Months to Payout Algorithm use the NPER formula

  -LOG( 1 - ( Monthly Interest * ( Loan / Monthly Payment )), 2) / LOG(1 + Monthly Interest, 2)

  NPER(rate, payment_amount, present_value)

Compound Interest With Monthly Contributions use the FV formula

  X = B * (1 + i) ^ n + A * (((1 + i) ^ n - 1) / i)

Where:

  B = initial balance
  i = interest rate
  A = monthly deposit
  n = months of investment
  X = final value of investment

FV(rate, number_of_periods, payment_amount, present_value, end_or_beginning)

rate
  The interest rate.
number_of_periods
  The number of payments to be made.
payment_amount
  The amount per period to be paid.
present_value
  The current value of the annuity.
end_or_beginning - [optional]
  Whether payments are due at the end (0) or beginning (1) of
  each period.

  */

var PMT = function (rate, number_of_periods, present_value) {
  return present_value * ((rate * Math.pow((1 + rate),number_of_periods)) / (Math.pow((1 + rate), number_of_periods) - 1))
}
// console.log('PMT(0.0031, 320, 117000) ', PMT(0.0031, 320, 117000))

var NPER = function (rate, payment_amount, present_value) {
  return -Math.log2(1 - (rate * (present_value / payment_amount))) / Math.log2(1 + rate);
}
//console.log('NPER(0.0031, 576.99, 117000) ', NPER(0.0031, 576.99, 117000))

var FV = function (rate, number_of_periods, payment_amount, present_value) {
  var value = present_value * Math.pow((1 + rate), number_of_periods) +
              payment_amount * (( Math.pow((1 + rate), number_of_periods) - 1) / rate);

  if (present_value < 0) {
    return -present_value - (-present_value + value);
  } else {
    return value;
  }
}
// console.log('FV(0.0031, 320, 576.99, 0)', FV(0.0031, 320, 576.99, 0))

function f(string) {
  return parseFloat(string.toString().replace(/[^0-9.-]/g,''));
}

function fv(amount, p) {
  var precision = p ? p : 2;
  return f(amount).toFixed(precision);
}

function $f(field) {
  return f($(field).val());
}

function m(amount) {
  if (amount === null) {
    return '';
  }

  var parts = amount.toFixed(2).split(".");
  // comma separated thousands groups
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "$" + parts.join(".")
}

function $mval(field, amount) {
  if ($(field).is('input')) {
    $(field).val(m(amount));
  } else {
    $(field).text(m(amount));
  }
}

function $fval(field, amount, precision) {
      sval = fv(amount, precision);

  if ($(field).is('input')) {
    $(field).val(sval);
  } else {
    $(field).text(sval);
  }
}

function $pval(field, amount) {
  var precision = 2,
      sval = (f(amount) * 100.0).toFixed(precision) + "%";

  if ($(field).is('input')) {
    $(field).val(sval);
  } else {
    $(field).text(sval);
  }
}

var Calculator = function () {
  this.mortgage_rate = 0;
  this.investment_rate = 0;
  this.mortgage_amount      = 0;
  this.mortgage_monthly_rate    = 0;
  this.mortgage_term            = 0;
  this.escrow                   = 0;
  this.starting_investment      = 0;
  this.investment_monthly_rate  = 0;
  this.monthly_before_payoff    = 0;
  this.monthly_after_payoff     = 0;
  this.payment_split            = 0;
  this.mortgage_share        = 0;
  this.investment_share      = 0;
  this.mortgage_share_perc   = 0;
  this.investment_share_perc = 0;
  this.default_monthly_payment = 0;
  this.total_payment = 0;
  this.total_payment_with_escrow = 0;
  this.split_mortgage = 0;
  this.split_investment = 0;
  this.payment_mortgage_before_payoff = 0;
  this.payment_investment_before_payoff = 0;
  this.payment_mortgage_after_payoff = 0;
  this.payment_investment_after_payoff = 0;
  this.payment_towards_loan = 0;
  this.payment_towards_loan_after = 0;
  this.months_to_payoff = 0;
  this.years_to_payoff = 0;
  this.amount_paid = 0;
  this.amount_saved = 0;

  this.year_template = _.template($('#year-template').text());
}

Calculator.prototype.calculate = function () {
  // convert percentages
  this.mortgage_rate = $('#mortgage_rate').val() / 100.0,
  this.investment_rate = $('#investment_rate').val() / 100.0;

  // update monthly rates
  $pval('#mortgage_monthly_rate', (this.mortgage_rate / 12.0), 4);
  $pval('#investment_monthly_rate', (this.investment_rate / 12.0), 4);

  // get other variables
  this.mortgage_amount         = $f('#mortgage_amount');
  this.mortgage_monthly_rate   = $f('#mortgage_monthly_rate') / 100.0;
  this.mortgage_term           = $f('#mortgage_term');
  this.escrow                  = $f('#escrow');
  this.starting_investment     = $f('#starting_investment');
  this.investment_monthly_rate = $f('#investment_monthly_rate') / 100.0;
  this.monthly_before_payoff   = $f('#monthly_before_payoff');
  this.monthly_after_payoff    = $f('#monthly_after_payoff');
  this.payment_split           = $f('#payment_split');

  $pval('#mortgage_share', (100 - this.payment_split) / 100.0);

  // update splits
  this.mortgage_share        = $f('#mortgage_share'),
  this.investment_share      = 100 - this.mortgage_share,
  this.mortgage_share_perc   = this.mortgage_share / 100.0,
  this.investment_share_perc = this.investment_share / 100.0;

  $pval('#investment_share', this.investment_share / 100.0);

  // defaults
  this.default_monthly_payment = PMT(this.mortgage_monthly_rate,
                                     this.mortgage_term,
                                     this.mortgage_amount),
  this.total_payment = this.default_monthly_payment * this.mortgage_term,
  this.total_payment_with_escrow = (this.default_monthly_payment + this.escrow) * this.mortgage_term;

  $mval('#default_monthly_payment', this.default_monthly_payment);
  $mval('#total_payment', this.total_payment);
  $mval('#total_payment_with_escrow', this.total_payment_with_escrow);

  // Basic Scenario
  this.split_mortgage = this.mortgage_share_perc,
  this.split_investment = this.investment_share_perc,
  this.payment_mortgage_before_payoff = this.monthly_before_payoff * this.mortgage_share_perc,
  this.payment_investment_before_payoff = this.monthly_before_payoff * this.investment_share_perc,
  this.payment_mortgage_after_payoff = this.monthly_after_payoff * this.mortgage_share_perc,
  this.payment_investment_after_payoff = this.monthly_after_payoff * this.investment_share_perc,
  this.payment_towards_loan = this.payment_mortgage_before_payoff - this.escrow,
  this.payment_towards_loan_after = this.payment_mortgage_after_payoff - this.escrow,
  this.months_to_payoff = NPER(this.mortgage_monthly_rate,
                               this.payment_towards_loan,
                               this.mortgage_amount),
  this.years_to_payoff = this.months_to_payoff / 12,
  // includes ongoing escrow cost
  this.amount_paid = (this.months_to_payoff * this.payment_mortgage_before_payoff) +
                     ((this.mortgage_term - this.months_to_payoff) * this.escrow),
  this.amount_saved = this.total_payment_with_escrow - this.amount_paid;

  $pval('#split_mortgage', this.split_mortgage);
  $pval('#split_investment', this.split_investment);
  $mval('#payment_mortgage', this.payment_mortgage_before_payoff);
  $mval('#payment_investment', this.payment_investment_before_payoff);
  $mval('#payment_towards_loan', this.payment_towards_loan);
  $fval('#months_to_payoff', this.months_to_payoff, 1);
  $fval('#years_to_payoff', this.years_to_payoff, 1);
  $mval('#amount_paid', this.amount_paid);
  $mval('#amount_saved', this.amount_saved);

  var mortgage_balance = this.mortgage_amount,
      investment_balance = this.starting_investment;

  $('#year_results').empty();

  $('#year_results').append(this.year_template({
    paid: false,
    year: 'start',
    mortgage_paid: '',
    cumulative_interest: '',
    cumulative_principal: '',
    mortgage_balance: m(mortgage_balance),
    interest_paid: '',
    investment_payment: '',
    investment_balance: m(investment_balance)
  }));

  // $('#year_results').append(this.year_template({
  //   paid: false, year: '', mortgage: '', investment: ''
  // }));

  var ytp = Math.ceil(this.years_to_payoff);

  var mortgage = mortgage_balance,
      investment = investment_balance,
      investment_paid = 0,
      mortgage_paid = 0,
      cumulative_interest = 0,
      cumulative_principal = 0,
      mortgage_paid = 0,
      interest_paid = 0;

  for (var year = 1; year <= 32; year++) {
    // mortgage shrinks according to FV
    if (year <= ytp) {
      mortgage = FV(
        this.mortgage_monthly_rate,
        12,
        this.payment_towards_loan,
        -mortgage_balance
      );
      interest_paid += mortgage_balance - mortgage;
    }

    if (year === ytp) {
      i_pay = this.payment_investment_before_payoff;
      m_pay = mortgage_balance;

      // year of the payoff,
      // mortgage goes negative (overpayment),
      // overpayment goes to investment
      investment_balance += -mortgage;
      mortgage = null;

      // before payoff
      investment = FV(
        this.investment_monthly_rate,
        12,
        this.payment_investment_before_payoff,
        investment_balance
      );
    } else if (year > ytp) {
      i_pay = (this.payment_mortgage_after_payoff + this.payment_investment_after_payoff);
      m_pay = null;

      // after payoff
      investment = FV(
        this.investment_monthly_rate,
        12,
        this.payment_mortgage_after_payoff +
          this.payment_investment_after_payoff,
        investment_balance
      );
    } else {
      // monthly
      i_pay = this.payment_investment_before_payoff * 12;
      m_pay = this.payment_mortgage_before_payoff * 12;

      // before payoff
      investment = FV(
        this.investment_monthly_rate,
        12,
        this.payment_investment_before_payoff,
        investment_balance
      );
    }

    $('#year_results').append(this.year_template({
      paid: year > ytp,
      year: year,
      mortgage_paid: m(m_pay),
      cumulative_interest: '',
      cumulative_principal: '',
      mortgage_balance: m(mortgage_balance),
      interest_paid: m(interest_paid),
      investment_payment: m(i_pay),
      investment_balance: m(investment_balance)
    }));

    mortgage_balance = mortgage;
    investment_balance = investment;
  }

  this.total_invested = investment_balance;
}

$(function () {
  var calculator = new Calculator();

  $('form').on('submit', function (evt) {
    evt.preventDefault();
    calculator.calculate();
  });

  $('input[type=text], input[type=range]').on('input', function (evt) {
    calculator.calculate();
  });

  calculator.calculate();

  var snap_template = _.template($('#snap-template').text());

  $('#snapshot').on('click', function (evt) {
    evt.preventDefault();
    $('.snapshots').css({'display':'block'});
    $('.snapshots .snap-results').append(snap_template(calculator));
  });
});
