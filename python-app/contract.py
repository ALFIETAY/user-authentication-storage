import fitz
import os
import sys
import stat
from datetime import date
from dateutil.relativedelta import relativedelta
from datetime import datetime

script = sys.argv[0]
sysName = sys.argv[1]
sysLoanAmount = float(sys.argv[2])
sysLoanTenure = float(sys.argv[3])
print(sysName)
print(sysLoanAmount)
print(sysLoanTenure)

# define files
input_file = os.path.abspath("../python-app/pdf-docs/home_loan_contract.pdf")
output_file = "default_loan_contract.pdf"

#information needed name of lender, loan amount, loan tenure

# name of lender
name = sysName
# max loan amount
loanAmount = float(sysLoanAmount * 0.75)
# flat interest rate
yearlyInterestRate = 2.1
# monthly interest rate
monthlyInterestRate = float(2.1) / 100 / 12
# total no of months
years = float(sysLoanTenure) * 12
# total payment + finance charge
payment = loanAmount + 250

mortgagePayment = loanAmount * (monthlyInterestRate * (1 + monthlyInterestRate) ** years) / ((1 + monthlyInterestRate) ** years - 1)
mortgagePayment = "%.2f" % mortgagePayment

# date now
today = date.today()
# dd/mm/YY
dateNow = today.strftime("%d/%m/%Y")

# loan start date
current_month_text = datetime.now().strftime('%B')
current_year_full = datetime.now().strftime('%Y')
startDate = str((current_month_text + " " + current_year_full))

# loan end date
endDate = str(date.today() + relativedelta(months=+years))

# retrieve the first page of the PDF
doc = fitz.open(input_file)
first_page = doc[0]

# the text strings, each having 3 lines
years = str(int(years))
loanAmountDec = "%.2f" % loanAmount
paymentDec = "%.2f" % payment
amountOfLoan = "$" + str(loanAmountDec) 
totalOfPayment = "$" + str(paymentDec)
monthlyPayment = "$" + str(mortgagePayment)
annualRate = str(yearlyInterestRate) + "% Annually"

# the insertion points, each with a 25 pix distance from the corners
# loan amount
p1 = fitz.Point(180, 460)
# total payment
p2 = fitz.Point(180, 502)
# monthly payment
p3 = fitz.Point(180, 516)
# annual rate
p4 = fitz.Point(180, 530)
# name of applicant
p5 = fitz.Point(195,173)

# promise to pay section
# no of months
p6 = fitz.Point(108, 303)
# amount lend
p7 = fitz.Point(460, 303)

# repayment section
# no of months
p8 = fitz.Point(475, 597)
# monthly payment
p9 = fitz.Point(263, 613)
# start date of payment
p10 = fitz.Point(72, 628)
# end date of payment
p11 = fitz.Point(227, 628)
# agreement date
p12 = fitz.Point(430, 130)

# create a Shape to draw on
shape = first_page.newShape()

# check if file exist
if os.path.exists(output_file):
    try:
        os.remove(output_file)
    except PermissionError:
        print('PermissionError, Please close file before proceeding')
        os.chmod(output_file, stat.S_IWRITE)
        os.remove(output_file)
else:
  print("The file does not exist. Creating Contract")

# insert the text strings
shape.insertText(p1, amountOfLoan)
shape.insertText(p2, totalOfPayment)
shape.insertText(p3, monthlyPayment)
shape.insertText(p4, annualRate)
shape.insertText(p5, name)
shape.insertText(p6, years)
shape.insertText(p7, amountOfLoan)
shape.insertText(p8, years)
shape.insertText(p9, monthlyPayment)
shape.insertText(p10, startDate)
shape.insertText(p11, endDate)
shape.insertText(p12, dateNow)

# store our work to the page
shape.commit()
doc.save("../user-server/pdf-docs/" + output_file)