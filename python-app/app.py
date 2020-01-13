import fitz
import os
import stat

# define files
input_file = os.path.abspath("../python-app/pdf-docs/home_loan_contract.pdf")
output_file = "loan_contract.pdf"
signature_file = os.path.abspath("../python-app/signature.png")

# define the position to place signature
image_rectangle = fitz.Rect(150, 630, 600, 720)

# retrieve the second page of the PDF
file_handle = fitz.open(input_file)
first_page = file_handle[1]

if os.path.exists(output_file):
    try:
        os.remove(output_file)
    except PermissionError:
        print('PermissionError, Please close file before proceeding')
        os.chmod(output_file, stat.S_IWRITE)
        os.remove(output_file)
else:
  print("The file does not exist. Creating Loan contract")

# add the image
first_page.insertImage(image_rectangle, filename =signature_file)

file_handle.save("../user-server/pdf-docs/" + output_file)