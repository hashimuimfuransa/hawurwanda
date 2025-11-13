# Script to fix duplicate code in admin.ts

with open('server/src/routes/admin.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the duplicate section
duplicate_start = content.find('      message: `${role} user created successfully`,')
if duplicate_start != -1:
    # Find the end of the duplicate section
    duplicate_end = content.find('});', duplicate_start)
    if duplicate_end != -1:
        duplicate_end += 3  # Include the closing });
        
        # Find the real end of the section (next catch block)
        real_end = content.find('  } catch (error) {', duplicate_end)
        if real_end != -1:
            real_end = content.find('  }', real_end + 1) + 3
            
            # Keep only the first occurrence
            fixed_content = content[:duplicate_start] + content[real_end:]
            
            with open('server/src/routes/admin.ts', 'w', encoding='utf-8') as f:
                f.write(fixed_content)
                
            print("File fixed successfully!")
        else:
            print("Could not find the end of the duplicate section")
    else:
        print("Could not find the end of the duplicate section")
else:
    print("Duplicate section not found")