#!/usr/bin/env python3
"""
Script to move testimonials section from middle of page to before footer
"""

# Read the file
with open('c:\\Users\\Lenovo\\hawurwanda\\client\\src\\pages\\Home.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the testimonials section (lines 546-602 in original, but indices are 0-based so 545-601)
# Looking for the section that starts with:
# <section className="relative py-24 overflow-hidden">
#   <div className="absolute inset-0">
#     <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/70 to-sky-50/70...

# And ends with:
# </div>
# </section>
# (followed by the "Our Programmes" section)

testimonials_start = None
testimonials_end = None

for i, line in enumerate(lines):
    # Find start - look for the memberStories section
    if "memberStories" in line and testimonials_start is None:
        # Go back to find the opening section tag
        for j in range(i, -1, -1):
            if '<section className="relative py-24 overflow-hidden">' in line[j]:
                testimonials_start = j
                break
        if testimonials_start is None:
            # Look back further
            for j in range(i-1, max(0, i-100), -1):
                if '<section className="relative py-24 overflow-hidden">' in lines[j]:
                    testimonials_start = j
                    break
    
    # Find end - look for next section after memberStories
    if testimonials_start is not None and testimonials_end is None:
        if i > testimonials_start + 10:  # Make sure we're past the start
            if '<section className="relative py-24 overflow-hidden">' in line and 'ourProgrammesLabel' in ''.join(lines[i:min(i+20, len(lines))]):
                testimonials_end = i - 1
                break

# If we couldn't find it programmatically, let's search differently
if testimonials_start is None or testimonials_end is None:
    print("Searching with alternative method...")
    for i, line in enumerate(lines):
        if "whatOurMembersSay" in line:
            print(f"Found 'whatOurMembersSay' at line {i+1}: {line.strip()}")
            # Go back to find section start
            for j in range(i, max(0, i-100), -1):
                if '<section className="relative py-24 overflow-hidden">' in lines[j]:
                    testimonials_start = j
                    print(f"Found section start at line {j+1}")
                    break
        if "ourProgrammesLabel" in line:
            print(f"Found 'ourProgrammesLabel' at line {i+1}: {line.strip()}")
            testimonials_end = i - 3  # Go back to before the next section
            print(f"Found next section at line {i+1}, so testimonials end at {testimonials_end}")
            break

print(f"Testimonials start: {testimonials_start}, end: {testimonials_end}")

if testimonials_start is not None and testimonials_end is not None:
    # Extract testimonials section
    testimonials_section = lines[testimonials_start:testimonials_end+1]
    
    # Remove from original location
    new_lines = lines[:testimonials_start] + lines[testimonials_end+1:]
    
    # Find where to insert (before footer, which starts with <footer className)
    footer_index = None
    for i, line in enumerate(new_lines):
        if '<footer className=' in line:
            footer_index = i
            break
    
    if footer_index is not None:
        print(f"Found footer at line {footer_index}")
        # Insert testimonials before footer
        final_lines = new_lines[:footer_index] + testimonials_section + ['\n'] + new_lines[footer_index:]
        
        # Write back
        with open('c:\\Users\\Lenovo\\hawurwanda\\client\\src\\pages\\Home.tsx', 'w', encoding='utf-8') as f:
            f.writelines(final_lines)
        
        print("Successfully moved testimonials section to before footer!")
    else:
        print("ERROR: Could not find footer!")
else:
    print("ERROR: Could not find testimonials section!")