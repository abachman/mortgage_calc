A simple mortgage calculator, useful for finding a balance between paying off
debpt early vs. investing early. Since calculations like this depend on *a lot*
of unknowable variables (e.g., future interest rate of investments), it's only
really useful as a handy way of getting a feel for compound interest tradeoffs.

The goal is to answer the question, "Is it better to pay off my debt early or
should I put that money into an investment right now?"

## Formulas

### Monthly Debt Payment

Given a debt with a particular interest rate paid down monthly, how big will
the monthly payment have to be in order to pay off the debt?

The Monthly Debt Payment algorithm uses the `PMT` formula. In plain English:

    Loan * ((Monthly Interest * (1 + Monthly Interest) ^ Term in Months) / (((1 + Monthly Interest) ^ Term in Months) - 1))

How it looks in a spreadsheet app:

    PMT(rate, number_of_periods, present_value, [future_value], [end_or_beginning])


### Months to Payment Completion

Given a debt with a particular interest rate, how long will it take to finish
paying it off if I pay the given amount?

Months to payment completion algorithm use the `NPER` formula. In plain English:

    -LOG( 1 - ( Monthly Interest * ( Loan / Monthly Payment )), 2) / LOG(1 + Monthly Interest, 2)

And in an app:

    NPER(rate, payment_amount, present_value)

### Compound Interest With Monthly Contributions

How large will an investment be after a particular number of months at the
given interest rate if I add a constant amount to it each month.

The Compound Interest With Monthly Contributions algorithm uses the `FV` ("Future Value")
formula. Plain English:

    X = B * (1 + i) ^ n + A * (((1 + i) ^ n - 1) / i)

Where:

    B = initial balance
    i = interest rate
    A = monthly deposit
    n = months of investment
    X = final value of investment

And in the app:

    FV(rate, number_of_periods, payment_amount, present_value, end_or_beginning)

Where:

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


- Adam Bachman, 2016

