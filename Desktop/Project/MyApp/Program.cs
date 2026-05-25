using System;
using System.IO;

class StudentGrades
{
    static void Main()
    {
        string studentsFile = "Student.txt";
        string gradesFile = "grades.txt";

        if (!File.Exists(studentsFile))
        {
            Console.WriteLine("Error: Student.txt not found.");
            return;
        }
        
        string[] studentLines = File.ReadAllLines(studentsFile);

        Console.Write("Enter Student Number: ");
        string studentNumber = Console.ReadLine() ?? ""; 

        bool found = false;

        foreach (string line in studentLines)
        {
            string[] parts = line.Split(',');

            if (parts.Length == 4 && parts[0] == studentNumber)
            {
                found = true;

                string firstName = parts[1];
                string lastName = parts[2];
                string program = parts[3];

                Console.WriteLine("\nStudent Found!");
                Console.WriteLine($"Name: {firstName} {lastName}");
                Console.WriteLine($"Program: {program}\n");

                Console.Write("Enter Prelim Grade: ");
                double prelim = Convert.ToDouble(Console.ReadLine() ?? "0");

                Console.Write("Enter Midterm Grade: ");
                double midterm = Convert.ToDouble(Console.ReadLine() ?? "0");

                Console.Write("Enter Final Grade: ");
                double final = Convert.ToDouble(Console.ReadLine() ?? "0");

                double average = (prelim + midterm + final) / 3.0;

                string remark;
                if (average >= 90)
                    remark = "Excellent";
                else if (average >= 80)
                    remark = "Good";
                else if (average >= 75)
                    remark = "Passed";
                else
                    remark = "Failed";

                Console.WriteLine($"\nAverage: {average:F2}");
                Console.WriteLine($"Remark: {remark}");

                string record = $"{studentNumber},{prelim},{midterm},{final},{average:F2},{remark}";
                File.AppendAllText(gradesFile, record + Environment.NewLine);

                break;
            }
        }

        if (!found)
        {
            Console.WriteLine("\nStudent not found.");
        }
    }
}
